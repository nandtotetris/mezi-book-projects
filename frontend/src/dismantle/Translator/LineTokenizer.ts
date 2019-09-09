import Tokenizr from 'tokenizr';

import { HackTranslatorException } from './types';

class LineTokenizer {
  // Token types
  static readonly TYPE_SYMBOL: number = 2;
  static readonly TYPE_IDENTIFIER: number = 3;
  static readonly TYPE_INT_CONST: number = 4;
  static readonly TYPE_COMMENT: number = 5;
  static readonly TYPE_SPACE: number = 6;

  // The parser
  private parser: Tokenizr = new Tokenizr();

  // The current token object
  private currentToken: any = null;

  // The current token type
  private currentTokenType: number = 2;

  // current input
  private input: string = '';

  constructor(line: string) {
    this.input = line;
    this.initializeInput(line);
  }

  // Numbers are parsed
  public parseNumbers() {
    this.parser.rule(/[+-]?[0-9]+/, (ctx, match) => {
      ctx.accept(`${LineTokenizer.TYPE_INT_CONST}`);
    });
  }

  // C-style (/* .. */) as well as C++ style (// ...) comments are recognized
  public slashSlashComments() {
    this.parser.rule(/(?:\/\*(?:[\s\S]*?)\*\/)|(\/\/.*)/, (ctx, match) => {
      ctx.accept(`${LineTokenizer.TYPE_COMMENT}`);
    });
  }

  // Treat space, \n, \r and \t as white space characters
  public whiteSpaceCharsSnrt() {
    this.parser.rule(/[ \t\r\n]+/, (ctx, match) => {
      ctx.accept(`${LineTokenizer.TYPE_SPACE}`);
    });
  }

  // A number of characters are parsed as word chars
  public wordCharsForLineTokenizer() {
    this.parser.rule(/[a-zA-Z0-9_\+\-\:\.\!&\|\$]+/, (ctx, match) => {
      ctx.accept(`${LineTokenizer.TYPE_IDENTIFIER}`);
    });
    // symbol chars should come after the word chars, to avoid conflict
    this.symbolChars();
  }

  // Resets this tokenizer's syntax table so that all characters are "ordinary." See the ordinaryChar method for more information on a character being ordinary.
  public resetSyntax() {
    this.parser = new Tokenizr();
    this.parser.input(this.input);
    this.parser.debug(false);
  }

  public nextToken() {
    this.currentToken = this.parser.token();

    if (this.currentToken !== null) {
      this.currentTokenType = parseInt(this.currentToken.type, 10);
      if (
        this.currentTokenType !== LineTokenizer.TYPE_SYMBOL &&
        this.currentTokenType !== LineTokenizer.TYPE_IDENTIFIER
      ) {
        this.nextToken();
      }
    }
  }
  /**
   * Advances the parser to the next token.
   * Throws HackTranslatorException if a token is expected and there are no
   * more tokens.
   */
  public advance(expectToken: boolean) {
    this.nextToken();

    if (expectToken && !this.currentToken) {
      throw new HackTranslatorException(
        'Unexpected end of line, at line (was expecting token):' +
          this.currentToken.line,
      );
    }
  }

  /**
   * Return the current token, or null if no more tokens.
   */
  public token(): string {
    if (this.currentToken) {
      return this.currentToken.value;
    }
    return '';
  }

  /**
   * If the current token is a number, returns its numeric value, otherwise returns 0.
   */
  public number(): number {
    if (this.currentTokenType === LineTokenizer.TYPE_INT_CONST) {
      return parseInt(this.currentToken.value, 10);
    } else {
      return 0;
    }
  }
  /**
   * If the current token is a symbol, returns it. Otherwise returns 0.
   */
  public symbol(): string {
    if (this.currentTokenType === LineTokenizer.TYPE_SYMBOL) {
      return this.currentToken.value;
    } else {
      return '\x00';
    }
  }

  /**
   * Checks whether the current token matches the given token
   */
  public isToken(token: string): boolean {
    return this.token() === token;
  }

  /**
   * Checks whether the current token is a word.
   */
  public isWord(): boolean {
    return this.currentTokenType === LineTokenizer.TYPE_IDENTIFIER;
  }

  /**
   * Checks whether the current token is a number.
   */
  public isNumber(): boolean {
    return this.currentTokenType === LineTokenizer.TYPE_INT_CONST;
  }

  /**
   * Checks whether the current token is a symbol.
   */
  public isSymbol(): boolean {
    return this.currentTokenType === LineTokenizer.TYPE_SYMBOL;
  }

  /**
   * Checks whether the tokenizer reached its end.
   */
  public isEnd(): boolean {
    return this.currentToken === null;
  }

  /**
   * Makes sure that there are no more tokens. If there are, throw an exception.
   */
  public ensureEnd() {
    this.advance(false);

    if (!this.isEnd()) {
      throw new HackTranslatorException(
        `end of line expected, '${this.token()}' is found`,
      );
    }
  }

  /**
   * Returns true if the tokenizer contains the given token.
   * The tokenizer advances until its end to find the token.
   */
  public contains(token: string): boolean {
    let found: boolean = false;

    while (!found && !this.isEnd()) {
      found = this.token() === token;
      if (!found) {
        try {
          this.advance(false);
        } catch (hte) {}
      }
    }

    return found;
  }

  protected initializeInput(input: string) {
    this.parser = new Tokenizr();
    this.parser.input(input);
    this.parser.debug(false);
  }

  // Unmatched character is treated as a symbol character
  private symbolChars() {
    this.parser.rule(/./, (ctx, match) => {
      ctx.accept(`${LineTokenizer.TYPE_SYMBOL}`);
    });
  }
}

export default LineTokenizer;
