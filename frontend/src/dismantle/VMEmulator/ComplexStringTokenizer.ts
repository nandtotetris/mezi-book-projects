import Tokenizr from 'tokenizr';

class StringTokenizer {
  // Token types
  static readonly TYPE_IDENTIFIER: number = 3;
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

  // Treat space, \n, \r and \t as white space characters
  public whiteSpaceCharsSnrt() {
    this.parser.rule(/[ \t\r\n]+/, (ctx, match) => {
      ctx.accept(`${StringTokenizer.TYPE_SPACE}`);
    });
  }

  // A number of characters are parsed as word chars
  public wordCharsForStringTokenizer() {
    this.parser.rule(/[^ \t\r\n]+/, (ctx, match) => {
      ctx.accept(`${StringTokenizer.TYPE_IDENTIFIER}`);
    });
  }

  // Resets this tokenizer's syntax table so that all characters are "ordinary." See the ordinaryChar method for more information on a character being ordinary.
  public resetSyntax() {
    this.parser = new Tokenizr();
    this.parser.input(this.input);
    this.parser.debug(false);
    this.initializeInput(this.input);
  }

  public nextToken() {
    this.currentToken = this.parser.token();

    if (this.currentToken !== null) {
      this.currentTokenType = parseInt(this.currentToken.type, 10);
      if (this.currentTokenType !== StringTokenizer.TYPE_IDENTIFIER) {
        this.nextToken();
      }
    }
    return this.token();
  }
  /**
   * Advances the parser to the next token.
   * Throws HackTranslatorException if a token is expected and there are no
   * more tokens.
   */
  public advance(expectToken: boolean) {
    this.nextToken();

    if (expectToken && !this.currentToken) {
      throw new Error(
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
   * Checks whether the current token matches the given token
   */
  public isToken(token: string): boolean {
    return this.token() === token;
  }

  /**
   * Checks whether the current token is a word.
   */
  public isWord(): boolean {
    return this.currentTokenType === StringTokenizer.TYPE_IDENTIFIER;
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
      throw new Error(`end of line expected, '${this.token()}' is found`);
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

  public hasMoreTokens(): boolean {
    return this.parser.peek() !== null;
  }

  /**
   * Counts the number of tokens
   */
  public countTokens(): number {
    let count: number = 0;
    while (!this.isEnd()) {
      count++;
      try {
        this.advance(false);
      } catch (hte) {}
    }
    this.resetSyntax();
    return count;
  }

  protected initializeInput(input: string) {
    this.parser = new Tokenizr();
    this.parser.input(input);
    this.parser.debug(false);
  }
}

export default StringTokenizer;
