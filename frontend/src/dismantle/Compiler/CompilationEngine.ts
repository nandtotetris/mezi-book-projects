import JackTokenizer from 'dismantle/Compiler/JackTokenizer';

class CompilationEngine {
  private tokenizer: JackTokenizer;
  private output: string[] = [];
  private currentMethod: string[] = [];
  /**
   * Creates a new compilation engine with the given input
   * and output.
   * The next routine called must be compileClass()
   * @param input
   * @param output
   */
  constructor(input: string, output: string) {
    this.tokenizer = new JackTokenizer(input);
    this.compileClass();
  }

  /**
   * 'class' className '{' classVarDec* subroutineDec* '}'
   */
  public compileClass() {
    this.currentMethod.push('compileClass');
    // <class>
    this.output.push('<class>');
    // class
    this.pushKeyword({ keyword: 'class' });
    // className
    this.pushIdentifier();
    // {
    this.pushSymbol({ symbol: '{' });
    // classVarDec, subRoutineDec, or }
    this.tokenizer.advance();
    if (this.tokenizer.tokenType() === JackTokenizer.TYPE_KEYWORD) {
      let keyword: string;
      // classVarDec*
      do {
        if (this.tokenizer.tokenType() !== JackTokenizer.TYPE_KEYWORD) {
          break;
        }
        keyword = this.tokenizer.keyWord();
        if (keyword !== 'static' && keyword !== 'field') {
          break;
        }
        this.compileClassVarDec();
        this.tokenizer.advance();
      } while (true);
      // compileRoutineDec*
      do {
        if (this.tokenizer.tokenType() !== JackTokenizer.TYPE_KEYWORD) {
          break;
        }
        keyword = this.tokenizer.keyWord();
        if (
          keyword !== 'constructor' &&
          keyword !== 'function' &&
          keyword !== 'method'
        ) {
          break;
        }
        this.compileSubroutine();
        this.tokenizer.advance();
      } while (true);
    }
    // }
    this.pushSymbol({ symbol: '}', advance: false });
    // </class>
    this.output.push('</class>');
    this.currentMethod.pop();
  }

  /**
   * Compiles a static declaration or a field declaration
   * ('static' | 'field') type varName(',' varName)* ';'
   */
  public compileClassVarDec() {
    this.currentMethod.push('compileClassVarDec');
    // <classVarDec>
    this.output.push('<classVarDec>');
    // static | field
    this.pushKeyword({ advance: false, keywords: ['static', 'field'] });
    // type
    this.tokenizer.advance();
    if (this.tokenizer.tokenType() === JackTokenizer.TYPE_KEYWORD) {
      this.pushKeyword({ advance: false });
    } else {
      this.pushIdentifier(false);
    }
    do {
      // varName
      this.pushIdentifier();
      // , or ;
      this.pushSymbol({ symbols: [',', ';'] });
      if (this.tokenizer.symbol() === ';') {
        break;
      }
    } while (true);
    // </classVarDec>
    this.output.push('</classVarDec>');
    this.currentMethod.pop();
  }

  /**
   * Compiles a complete method, function, or constructor
   * ('constructor' | 'function' | 'method')
   * ('void' | type) subroutineName '(' parameterList ')'
   * subroutineBody
   */
  public compileSubroutine() {
    this.currentMethod.push('compileSubroutine');
    // <subroutineDec>
    this.output.push('<subroutineDec>');
    // constructor | function | method
    this.pushKeyword({
      advance: false,
      keywords: ['constructor', 'function', 'method'],
    });
    // void | type
    this.tokenizer.advance();
    if (this.tokenizer.tokenType() === JackTokenizer.TYPE_KEYWORD) {
      this.pushKeyword({ advance: false });
    } else {
      this.pushIdentifier(false);
    }
    // subroutineName
    this.pushIdentifier();
    // (
    this.pushSymbol({ symbol: '(' });
    // parameterList
    this.compileParameterList();
    // )
    this.pushSymbol({ symbol: ')' });
    // subroutineBody
    this.compileSubroutineBody();
    // </subroutineDec>
    this.output.push('</subroutineDec>');
    this.currentMethod.pop();
  }

  /**
   * Compiles a (possibly empty) parameter list, not including the enclosing ()
   * ( (type varName) (',' type varName)* )?
   */
  public compileParameterList() {
    this.currentMethod.push('compileParameterList');
    this.currentMethod.pop();
  }

  public getXmlOutput(): string {
    return this.output.join('\n');
  }

  /**
   * '{' varDec* statements '}'
   */
  private compileSubroutineBody() {
    this.currentMethod.push('compileSubroutineBody');
    this.tokenizer.advance();
    this.tokenizer.advance();
    this.currentMethod.pop();
  }

  private getCurrentMethod(): string {
    return this.currentMethod[this.currentMethod.length - 1];
  }

  private reportTypeError(expected: number) {
    const found: number = this.tokenizer.tokenType();
    if (found !== expected) {
      throw new Error(
        `In ${this.getCurrentMethod()}:, expected type ${this.translateType(
          expected,
        )}, but found:${this.translateType(found)}`,
      );
    }
  }

  private reportKeywordError(expected: string) {
    const keyword: string = this.tokenizer.keyWord();
    if (keyword !== expected) {
      throw new Error(
        `In method: ${this.getCurrentMethod()}, Expected keyword: ${expected}, but found: ${keyword}`,
      );
    }
  }

  private reportKeywordsError(expecteds: string[]) {
    const keyword: string = this.tokenizer.keyWord();
    if (expecteds.indexOf(keyword) === -1) {
      throw new Error(
        `In method: ${this.getCurrentMethod()}, Expected keyword in: ${expecteds}, but found: ${keyword}`,
      );
    }
  }

  private reportSymbolError(expected: string) {
    const symbol: string = this.tokenizer.symbol();
    if (symbol !== expected) {
      throw new Error(
        `In method: ${this.getCurrentMethod()}, Expected symbol: ${expected}, but found: ${symbol}`,
      );
    }
  }

  private reportSymbolsError(expecteds: string[]) {
    const symbol: string = this.tokenizer.symbol();
    if (expecteds.indexOf(symbol) === -1) {
      throw new Error(
        `In method: ${this.getCurrentMethod()}, Expected symbol in: ${expecteds}, but found: ${symbol}`,
      );
    }
  }

  private pushSymbol({
    symbol,
    symbols,
    advance = true,
  }: {
    symbol?: string;
    symbols?: string[];
    advance?: boolean;
  }) {
    if (advance) {
      this.tokenizer.advance();
    }
    this.reportTypeError(JackTokenizer.TYPE_SYMBOL);
    if (symbol !== undefined) {
      this.reportSymbolError(symbol);
    }
    if (symbols !== undefined) {
      this.reportSymbolsError(symbols);
    }
    this.output.push(`<symbol>${this.tokenizer.symbol()}</symbol>`);
  }

  private pushKeyword({
    keyword,
    keywords,
    advance = true,
  }: {
    keyword?: string;
    keywords?: string[];
    advance?: boolean;
  }) {
    if (advance) {
      this.tokenizer.advance();
    }
    this.reportTypeError(JackTokenizer.TYPE_KEYWORD);
    if (keyword !== undefined) {
      this.reportKeywordError(keyword);
    }
    if (keywords !== undefined) {
      this.reportKeywordsError(keywords);
    }
    this.output.push(`<keyword>${this.tokenizer.keyWord()}</keyword>`);
  }

  private pushIdentifier(advance: boolean = true) {
    if (advance) {
      this.tokenizer.advance();
    }
    this.reportTypeError(JackTokenizer.TYPE_IDENTIFIER);
    this.output.push(`<identifier>${this.tokenizer.identifier()}</identifier>`);
  }

  private translateType(type: number): string {
    switch (type) {
      case JackTokenizer.TYPE_KEYWORD:
        return 'KEYWORD';
      case JackTokenizer.TYPE_SYMBOL:
        return 'SYMBOL';
      case JackTokenizer.TYPE_IDENTIFIER:
        return 'IDENTIFIER';
      case JackTokenizer.TYPE_INT_CONST:
        return 'INT_CONST';
      case JackTokenizer.TYPE_STRING_CONST:
        return 'STRING_CONST';
      default:
        return 'UNKNOWN_TYPE';
    }
  }
}

export default CompilationEngine;
