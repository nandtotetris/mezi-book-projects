import Hashtable from 'dismantle/Common/Hashtable';
import Tokenizr from 'tokenizr';

export const KW_CLASS_STR = 'class';
export const KW_CONSTRUCTOR_STR = 'constructor';
export const KW_FUNCTION_STR = 'function';
export const KW_METHOD_STR = 'method';
export const KW_FIELD_STR = 'field';
export const KW_STATIC_STR = 'static';
export const KW_VAR_STR = 'var';
export const KW_INT_STR = 'int';
export const KW_CHAR_STR = 'char';
export const KW_BOOLEAN_STR = 'boolean';
export const KW_VOID_STR = 'void';
export const KW_TRUE_STR = 'true';
export const KW_FALSE_STR = 'false';
export const KW_NULL_STR = 'null';
export const KW_THIS_STR = 'this';
export const KW_LET_STR = 'let';
export const KW_DO_STR = 'do';
export const KW_IF_STR = 'if';
export const KW_ELSE_STR = 'else';
export const KW_WHILE_STR = 'while';
export const KW_RETURN_STR = 'return';

export const SYM_CURLY_OPEN_STR = '{';
export const SYM_CURLY_CLOSE_STR = '}';
export const SYM_PARENTH_OPEN_STR = '(';
export const SYM_PARENTH_CLOSE_STR = ')';
export const SYM_SQUARE_OPEN_STR = '[';
export const SYM_SQUARE_CLOSE_STR = ']';
export const SYM_EQUAL_STR = '=';
export const SYM_PLUS_STR = '+';
export const SYM_MINUS_STR = '-';
export const SYM_DIVIDE_STR = '/';
export const SYM_REMAINDER_STR = '%';
export const SYM_MULTIPLY_STR = '*';
export const SYM_GREATER_STR = '>';
export const SYM_LESS_STR = '<';
export const SYM_AND_STR = '&';
export const SYM_OR_STR = '|';
export const SYM_INVERT_STR = '~';
export const SYM_SINGLE_QUOTE_STR = "'";
export const SYM_DOUBLE_QUOTE_STR = '"';
export const SYM_COMMA_STR = ',';
export const SYM_SEMICOLON_STR = ';';
export const SYM_DOT_STR = '.';

class JackTokenizer {
  // Token types
  static readonly TYPE_WORD: number = 0;
  static readonly TYPE_KEYWORD: number = 1;
  static readonly TYPE_SYMBOL: number = 2;
  static readonly TYPE_IDENTIFIER: number = 3;
  static readonly TYPE_INT_CONST: number = 4;
  static readonly TYPE_STRING_CONST: number = 5;

  // Keywords of the scripting language
  static readonly KW_CLASS: number = 1;
  static readonly KW_CONSTRUCTOR: number = 2;
  static readonly KW_FUNCTION: number = 3;
  static readonly KW_METHOD: number = 4;
  static readonly KW_FIELD: number = 5;
  static readonly KW_STATIC: number = 6;
  static readonly KW_VAR: number = 7;
  static readonly KW_INT: number = 8;
  static readonly KW_CHAR: number = 9;
  static readonly KW_BOOLEAN: number = 10;
  static readonly KW_VOID: number = 11;
  static readonly KW_TRUE: number = 12;
  static readonly KW_FALSE: number = 13;
  static readonly KW_NULL: number = 14;
  static readonly KW_THIS: number = 15;
  static readonly KW_LET: number = 16;
  static readonly KW_DO: number = 17;
  static readonly KW_IF: number = 18;
  static readonly KW_ELSE: number = 19;
  static readonly KW_WHILE: number = 20;
  static readonly KW_RETURN: number = 21;

  // The parser
  private parser: Tokenizr = new Tokenizr();

  // The current token object
  private currentToken: any = null;

  // The current token type
  private currentTokenType: number = 2;

  // keywords hashtable
  private keywords: Hashtable = new Hashtable();

  // jack source
  private source: string = '';
  /**
   * Opens the input file/stream and gets ready to
   * tokenize it
   * @param input jack source code
   */
  constructor(input: string) {
    this.initializeInput(input);
  }

  /**
   * Do we have more tokens in the input?
   */
  public hasMoreTokens(): boolean {
    try {
      const peekedToken: any = this.parser.peek(1);
      return peekedToken !== null;
    } catch {
      return false;
    }
  }

  /**
   * Peeks into the next vlaue of the parser
   */
  public peek(): any {
    if (this.hasMoreTokens()) {
      return this.parser.peek(0).value;
    }
    return undefined;
  }

  /**
   * Gets the next token from the input and makes it the
   * current token. This method should only be called
   * if hasMoreTokens() is true. Initially there is no
   * current token.
   */
  public advance() {
    if (this.hasMoreTokens()) {
      this.currentToken = this.parser.token();

      this.currentTokenType = parseInt(this.currentToken.type, 10);
      if (this.currentTokenType === JackTokenizer.TYPE_WORD) {
        const value: string = this.currentToken.value;
        if (this.keywords.get(value) !== undefined) {
          this.currentTokenType = JackTokenizer.TYPE_KEYWORD;
        } else {
          this.currentTokenType = JackTokenizer.TYPE_IDENTIFIER;
        }
      }
    }
  }

  /**
   * Returns the type of the current token
   */
  public tokenType(): number {
    return this.currentTokenType;
  }

  /**
   * Returns the keyword which is the current
   * token. Should be called only when tokenType()
   * is KEYWORD
   */
  public keyWord(): string {
    if (this.tokenType() === JackTokenizer.TYPE_KEYWORD) {
      return this.currentToken.value;
    }
    return '';
  }

  /**
   * Returns the character which is the current token
   * Should be called only when tokenType() is SYMBOL
   */
  public symbol(): string {
    if (this.currentTokenType === JackTokenizer.TYPE_SYMBOL) {
      return this.currentToken.value;
    } else {
      return '\x00';
    }
  }

  /**
   * Returns the identifier which is the current token.
   * Should be called only when tokenType() is IDENTIFIER
   */
  public identifier(): string {
    if (this.currentTokenType === JackTokenizer.TYPE_IDENTIFIER) {
      return this.currentToken.value;
    } else {
      return '\x00';
    }
  }

  /**
   * Returns the integer value of the current token.
   * Should be called only when tokenType() is INT_CONST
   */
  public intVal(): number {
    if (this.currentTokenType === JackTokenizer.TYPE_INT_CONST) {
      return parseInt(this.currentToken.value, 10);
    } else {
      return -1;
    }
  }

  /**
   * Returns the string value of the current token,
   * without the double quotes.
   * Should be called only when tokenType() is STRING_CONST
   */
  public stringVal(): string {
    if (this.currentTokenType === JackTokenizer.TYPE_STRING_CONST) {
      const value: string = this.currentToken.value;
      return value.substring(1, value.length - 1);
    } else {
      return '';
    }
  }

  // Integer constant: a decimal number in the range 0 ... 32767
  private parseNumbers() {
    this.parser.rule(/[0-9]+/, (ctx, match) => {
      ctx.accept(`${JackTokenizer.TYPE_INT_CONST}`);
    });
  }

  // String constant: A sequence of unicode characters not
  // including double quote or new line
  private parseStrings() {
    this.parser.rule(/"[^\r\n\\"]*"/, (ctx, match) => {
      ctx.accept(`${JackTokenizer.TYPE_STRING_CONST}`);
    });
  }

  // C-style (/* .. */) as well as C++ style (// ...) comments are recognized
  private slashSlashComments() {
    this.parser.rule(/(?:\/\*(?:[\s\S]*?)\*\/)|(\/\/.*)/, (ctx, match) => {
      ctx.ignore();
    });
  }

  // Treat space, \n, \r and \t as white space characters
  private whiteSpaceCharsSnrt() {
    this.parser.rule(/[ \t\r\n]+/, (ctx, match) => {
      ctx.ignore();
    });
  }

  // - Jack identifier is a sequence of letters and digits,
  // and underscore, not starting with digit
  // - Keywords are also matched by this pattern
  // - So TYPE_WORD is assigned as a temporary type, it should
  // later be resolved into either TYPE_KEYWORD or TYPE_IDENTIFIER
  private wordCharsForLineTokenizer() {
    this.parser.rule(/[a-zA-Z_][a-zA-Z0-9_]*/, (ctx, match) => {
      ctx.accept(`${JackTokenizer.TYPE_WORD}`);
    });
    // symbol chars should be matched after word chars, whatever is not
    // matched by word chars will be a symbol char (or some illegal char)
    this.symbolChars();
  }

  private initializeInput(input: string) {
    this.source = input;
    this.parser = new Tokenizr();
    this.parser.input(this.source);
    this.parser.debug(false);
    this.slashSlashComments();
    this.parseStrings();
    this.parseNumbers();
    this.whiteSpaceCharsSnrt();
    this.wordCharsForLineTokenizer();
    this.initKeywords();
  }

  // Unmatched character is treated as a symbol character
  private symbolChars() {
    this.parser.rule(/./, (ctx, match) => {
      ctx.accept(`${JackTokenizer.TYPE_SYMBOL}`);
    });
  }

  private initKeywords() {
    this.keywords.put(KW_CLASS_STR, JackTokenizer.KW_CLASS);
    this.keywords.put(KW_CONSTRUCTOR_STR, JackTokenizer.KW_CONSTRUCTOR);
    this.keywords.put(KW_FUNCTION_STR, JackTokenizer.KW_FUNCTION);
    this.keywords.put(KW_METHOD_STR, JackTokenizer.KW_METHOD);
    this.keywords.put(KW_FIELD_STR, JackTokenizer.KW_FIELD);
    this.keywords.put(KW_STATIC_STR, JackTokenizer.KW_STATIC);
    this.keywords.put(KW_VAR_STR, JackTokenizer.KW_VAR);
    this.keywords.put(KW_INT_STR, JackTokenizer.KW_INT);
    this.keywords.put(KW_CHAR_STR, JackTokenizer.KW_CHAR);
    this.keywords.put(KW_BOOLEAN_STR, JackTokenizer.KW_BOOLEAN);
    this.keywords.put(KW_VOID_STR, JackTokenizer.KW_VOID);
    this.keywords.put(KW_TRUE_STR, JackTokenizer.KW_TRUE);
    this.keywords.put(KW_FALSE_STR, JackTokenizer.KW_FALSE);
    this.keywords.put(KW_NULL_STR, JackTokenizer.KW_NULL);
    this.keywords.put(KW_THIS_STR, JackTokenizer.KW_THIS);
    this.keywords.put(KW_LET_STR, JackTokenizer.KW_LET);
    this.keywords.put(KW_DO_STR, JackTokenizer.KW_DO);
    this.keywords.put(KW_IF_STR, JackTokenizer.KW_IF);
    this.keywords.put(KW_ELSE_STR, JackTokenizer.KW_ELSE);
    this.keywords.put(KW_WHILE_STR, JackTokenizer.KW_WHILE);
    this.keywords.put(KW_RETURN_STR, JackTokenizer.KW_RETURN);
  }

  /**
   * Removes space characters from the given string.
   */
  private removeSpaces(line: string): string {
    let stripped: string = '';
    for (const c of line) {
      if (c !== ' ') {
        stripped += c;
      }
    }
    return stripped;
  }
}

export default JackTokenizer;
