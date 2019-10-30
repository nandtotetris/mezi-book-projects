import Hashtable from 'dismantle/Common/Hashtable';
import { HDLException } from 'dismantle/Gates/internal';
import Tokenizr from 'tokenizr';

class HDLTokenizer {
  // Token types
  static readonly TYPE_KEYWORD: number = 1;
  static readonly TYPE_SYMBOL: number = 2;
  static readonly TYPE_IDENTIFIER: number = 3;
  static readonly TYPE_INT_CONST: number = 4;
  static readonly TYPE_COMMENT: number = 5;
  static readonly TYPE_SPACE: number = 6;

  // Keywords of the scripting language
  static readonly KW_CHIP: number = 1;
  static readonly KW_IN: number = 2;
  static readonly KW_OUT: number = 3;
  static readonly KW_BUILTIN: number = 4;
  static readonly KW_CLOCKED: number = 5;
  static readonly KW_PARTS: number = 6;

  // The parser
  private parser: Tokenizr = new Tokenizr();

  // Hashtable containign the keywords of the language
  private keywords: Hashtable = new Hashtable();

  // Hashtable containing the symbols of the language
  private symbols: Hashtable = new Hashtable();

  // The type of the current token
  private tokenType: number = 0;

  // The type of the current keyword
  private keyWordType: number = 0;

  // The current symbol, this was of char type in the java file
  private symbol: string = '';

  // The current int value
  private intValue: number = 0;

  // The current string value
  private stringValue: string = '';

  // The current identifier
  private identifier: string = '';

  // The current token object
  private currentToken: any = null;

  // The current value, this does not exist in the original java file
  private currentValue: string = '';

  // The source file name, this filed might not be relevant in a webapp
  // since directly reading a file is not allowed from a browser
  private fileName: string = '';

  constructor(input: string) {
    this.initializeInput(input);
  }
  // Returns the source file name
  getFileName(): string {
    return this.fileName;
  }

  /**
   * Advances the parser to the next token
   * if has no more toekns, throws an exception.
   */
  advance() {
    if (!this.hasMoreTokens()) {
      this.HDLError('Unexpected end of file');
    }

    try {
      this.currentValue = this.currentToken.value;
      this.stringValue = this.currentValue;
      const type = parseInt(this.currentToken.type, 10);
      switch (type) {
        case HDLTokenizer.TYPE_INT_CONST:
          this.tokenType = HDLTokenizer.TYPE_INT_CONST;
          this.intValue = parseInt(this.currentValue, 10);
          break;
        case HDLTokenizer.TYPE_IDENTIFIER:
          const keywordCode = this.keywords.get(this.currentValue);
          if (keywordCode !== undefined) {
            this.tokenType = HDLTokenizer.TYPE_KEYWORD;
            this.keyWordType = keywordCode;
          } else {
            this.tokenType = HDLTokenizer.TYPE_IDENTIFIER;
            this.identifier = this.currentValue;
          }
          break;
        case HDLTokenizer.TYPE_SYMBOL:
          this.tokenType = HDLTokenizer.TYPE_SYMBOL;
          this.symbol = this.symbols.get(this.currentValue);
          break;
      }
      this.currentToken = this.parser.token();
    } catch {
      throw new HDLException('Error while reading HDL file');
    }
  }

  // Returns the current token as a string
  getToken(): string {
    return this.currentValue;
  }

  /**
   * Returns the current token type
   */
  getTokenType(): number {
    return this.tokenType;
  }

  /**
   * Returns the keyword type of the current token
   * May only be called when getTokenType() == KEYWORD
   */
  getKeywordType(): number {
    return this.keyWordType;
  }

  /**
   * Returns the symbol of the current token
   * May only be called when getTokenType() == SYMBOL
   */
  getSymbol(): string {
    return this.symbol;
  }

  /**
   * Returns the int value of the current token
   * May only be called when getTokenType() == INT_CONST
   */
  getIntValue(): number {
    return this.intValue;
  }

  /**
   * Returns the string value of the current token
   * May only be called when getTokenType() == STRING_CONST
   */
  getStringValue(): string {
    return this.stringValue;
  }

  /**
   * Returns the identifier value of the current token
   * May only be called when getTokenType() == IDENTIFIER
   */
  getIdentifier(): string {
    return this.identifier;
  }

  /**
   * Returns if there are more tokens in the stream
   */
  hasMoreTokens(): boolean {
    return this.currentToken;
  }

  /**
   * Generates an HDLException with the given message.
   */
  HDLError(message: string) {
    throw new HDLException(`{message} line: ${this.currentToken.line}`);
  }

  protected initializeInput(input: string) {
    this.parser = new Tokenizr();
    this.parser.rule(/(?:\/\*(?:[\s\S]*?)\*\/)|(\/\/.*\n)/, (ctx, match) => {
      ctx.accept(`${HDLTokenizer.TYPE_COMMENT}`);
    });
    this.parser.rule(/[a-zA-Z_][a-zA-Z0-9_\]\[\:\.]*/, (ctx, match) => {
      ctx.accept(`${HDLTokenizer.TYPE_IDENTIFIER}`);
    });
    this.parser.rule(/[+-]?[0-9]+/, (ctx, match) => {
      ctx.accept(`${HDLTokenizer.TYPE_INT_CONST}`);
    });
    this.parser.rule(/[ \t\r\n]+/, (ctx, match) => {
      ctx.accept(`${HDLTokenizer.TYPE_SPACE}`);
    });
    this.parser.rule(/./, (ctx, match) => {
      ctx.accept(`${HDLTokenizer.TYPE_SYMBOL}`);
    });

    this.parser.input(input);
    this.parser.debug(false);

    this.currentToken = this.parser.token();

    this.initKeywords();
    this.initSymbols();
  }

  // Initializes the keywords hashtable
  private initKeywords() {
    this.keywords = new Hashtable();
    this.keywords.put('CHIP', HDLTokenizer.KW_CHIP);
    this.keywords.put('IN', HDLTokenizer.KW_IN);
    this.keywords.put('OUT', HDLTokenizer.KW_OUT);
    this.keywords.put('BUILTIN', HDLTokenizer.KW_BUILTIN);
    this.keywords.put('CLOCKED', HDLTokenizer.KW_CLOCKED);
    this.keywords.put('PARTS:', HDLTokenizer.KW_PARTS);
  }

  // Initializes the symbols hashtable
  private initSymbols() {
    this.symbols = new Hashtable();
    const chars: string[] = ['{', '}', ',', ';', '(', ')'];
    chars.forEach(c => {
      this.symbols.put(c, c);
    });
  }
}

export default HDLTokenizer;
