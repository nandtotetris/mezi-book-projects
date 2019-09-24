import JackTokenizer from 'dismantle/Compiler/JackTokenizer';
import Tokenizr from 'tokenizr';

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
    if (this.isKeyword()) {
      let keyword: string;
      // classVarDec*
      do {
        if (!this.isKeyword()) {
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
        if (!this.isKeyword()) {
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
    if (this.isKeyword()) {
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
    if (this.isKeyword()) {
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
    this.pushSymbol({ symbol: ')', advance: false });
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
    this.output.push('<parameterList>');
    this.tokenizer.advance();
    if (!this.isSymbol()) {
      do {
        // ========> type <======
        if (this.isKeyword()) {
          this.pushKeyword({ advance: false });
        } else {
          this.pushIdentifier(false);
        }
        // =========> varName <=========
        this.pushIdentifier();
        // ========> , <===========
        this.tokenizer.advance();
        this.reportTypeError(JackTokenizer.TYPE_SYMBOL);
        const symbol: string = this.tokenizer.symbol();
        if (symbol !== ',') {
          break; // symbol must be )
        }
        this.pushSymbol({ advance: false });
        this.tokenizer.advance();
      } while (true);
    }
    this.output.push('</parameterList>');
    this.currentMethod.pop();
  }

  /**
   * compiles a var declaration
   * 'var' type varName (',' varName)* ;
   */
  public compileVarDec() {
    this.currentMethod.push('compileVarDec');
    // <varDec>
    this.output.push('<varDec>');
    // ======> var <========
    this.pushKeyword({ advance: false, keyword: 'var' });
    // ======> type <=======
    this.tokenizer.advance();
    if (this.isKeyword()) {
      this.pushKeyword({ advance: false });
    } else {
      this.pushIdentifier(false);
    }
    do {
      // ======> varName <=======
      this.pushIdentifier();
      // ======> , or ; <=======
      this.pushSymbol({ symbols: [',', ';'] });
      if (this.tokenizer.symbol() === ';') {
        break;
      }
    } while (true);
    // </varDec>
    this.output.push('</varDec>');
    this.currentMethod.pop();
  }

  /**
   * Compiles a sequence of statements, not including the enclosing {}
   *
   */
  public compileStatements() {
    this.currentMethod.push('compileStatements');
    this.output.push('<statements>');
    let keyword: string;
    do {
      if (!this.isKeyword()) {
        break;
      }
      keyword = this.tokenizer.keyWord();
      if (keyword === 'let') {
        this.compileLet();
      } else if (keyword === 'do') {
        this.compileDo();
      } else if (keyword === 'while') {
        this.compileWhile();
      } else if (keyword === 'if') {
        this.compileIf();
      } else if (keyword === 'return') {
        this.compileReturn();
      } else {
        break;
      }
      // compileIf does advance itself
      if (keyword !== 'if') {
        this.tokenizer.advance();
      }
    } while (true);
    this.output.push('</statements>');
    this.currentMethod.pop();
  }

  /**
   * Compiles a let statement
   * 'let' varName ('[' expression ']')? '=' expression ';'
   */
  public compileLet() {
    this.currentMethod.push('compileLet');
    this.output.push('<letStatement>');
    // =======> let <=========
    this.pushKeyword({ advance: false });
    // =======> varName <=========
    this.pushIdentifier();
    // next has to be a symbol, either [ or =
    this.tokenizer.advance();
    // =======> ('[' expression ']')? <=========
    this.reportTypeError(JackTokenizer.TYPE_SYMBOL);
    const symbol: string = this.tokenizer.symbol();
    if (symbol === '[') {
      this.pushSymbol({ symbol: '[', advance: false });
      // expression
      this.tokenizer.advance();
      this.compileExpression();
      // ]
      this.pushSymbol({ symbol: ']' });
      // advance for =
      this.tokenizer.advance();
    } else if (symbol !== '=') {
      throw Error(`In method compileLet, invalid symbol: ${symbol}`);
    }
    // ============> = <=========
    this.pushSymbol({ symbol: '=', advance: false });
    // ============> expression <=========
    this.tokenizer.advance();
    this.compileExpression();
    // ============> ; <=========
    this.pushSymbol({ symbol: ';' });
    this.output.push('</letStatement>');
    this.currentMethod.pop();
  }

  /**
   * Compiles expression
   * term (op term)*
   */
  public compileExpression() {
    this.currentMethod.push('compileExpression');
    this.output.push('<expression>');
    this.compileTerm();
    do {
      this.tokenizer.advance();
      if (this.isOperand()) {
        this.pushSymbol({ advance: false });
        this.tokenizer.advance();
        this.compileTerm();
      }
    } while (true);
    this.output.push('</expression>');
    this.currentMethod.pop();
  }

  /**
   * Compiles a term. This routine is faced with a slight
   * difficulty when trying to decide between some of the
   * alternating parsing rules. Specifically, if the current
   * token is an identifier, the routine must distinguish
   * between a variable, an array entry, and a subroutine
   * call. A single look-ahead token, which may be one of
   * '[', '(' or '.' suffices to distinguish between the
   * three possibilities. Any other token is not part of
   * this term and should not be advanced over.
   * ---------------------
   * integrConstant | stringConstant | keywordConstant |
   * varName | varName '[' expression ']' | subroutineCall |
   * '(' expression ')' | unaryOp term
   */
  public compileTerm() {
    this.currentMethod.push('compileTerm');
    this.output.push('<term>');
    if (this.isIntegerConstant()) {
      this.output.push(
        `<integerConstant>${this.tokenizer.intVal()}</integerConstant>`,
      );
    } else if (this.isStringConstant()) {
      this.output.push(
        `<stringConstant>${this.tokenizer.intVal()}</stringConstant>`,
      );
    } else if (this.isKeywordConstant()) {
      this.pushKeyword({ advance: false });
    } else if (this.isSymbol()) {
      if (this.tokenizer.symbol() === '(') {
        this.pushSymbol({ advance: false });
        this.compileExpression();
        this.pushSymbol({ symbol: ')' });
      } else if (this.isUnaryOp()) {
        this.pushSymbol({ advance: false });
        this.compileTerm();
      } else {
        throw Error(
          `In compileTerm: Unexpected symbol: ${this.tokenizer.symbol()}`,
        );
      }
    } else if (this.isIdentifier()) {
      this.pushIdentifier(false);
      this.tokenizer.advance();
      if (this.isSymbol()) {
        const symbol: string = this.tokenizer.symbol();
        if (symbol === '[') {
          // array expression
        } else if (symbol === '(' || symbol === '.') {
          // subroutine call
        } else {
          // unknown
        }
      }
    } else {
      throw Error(`In compileTerm: Unknown term: ${this.getWord()}`);
    }
    this.output.push('</term>');
    this.currentMethod.pop();
  }

  /**
   * Compiles a do statement
   * 'do' subroutineCall ';'
   *  ---------- subroutineCall -----
   * subroutineName'(' expressionList? ')' |
   * ( className | varName )'.'subroutineName'(' expressionList? ')'
   */
  public compileDo() {
    this.currentMethod.push('compileDo');
    this.output.push('<doStatement>');
    // =======> do <=============
    this.pushKeyword({ advance: false });
    // =======> subroutineCall <=============
    // =======> subroutineName | className
    // | varName <=============
    this.pushIdentifier();
    this.tokenizer.advance();
    this.reportTypeError(JackTokenizer.TYPE_SYMBOL);
    const symbol: string = this.tokenizer.symbol();
    if (symbol === '.') {
      // ========> . <=======
      this.pushSymbol({ symbol: '.', advance: false });
      // ========> subroutineName <=======
      this.pushIdentifier();
      this.tokenizer.advance();
    }
    // ========> ( <=======
    this.pushSymbol({ symbol: '(', advance: false });
    this.tokenizer.advance();
    // ========> expressionList <=======
    this.compileExpressionList();
    // ========> ) <=======
    this.pushSymbol({ symbol: ')', advance: false });
    // =======> ; <=============
    this.pushSymbol({ symbol: ';' });
    this.output.push('</doStatement>');
    this.currentMethod.pop();
  }

  /**
   * Compiles a possibly empty list of expressions
   * (expression (',' expression)*)?
   */
  public compileExpressionList() {
    this.currentMethod.push('compileExpressionList');
    this.output.push('<expressionList>');
    if (this.isIdentifier()) {
      do {
        this.compileExpression();
        this.tokenizer.advance();
        this.reportTypeError(JackTokenizer.TYPE_SYMBOL);
        if (this.tokenizer.symbol() === ')') {
          break;
        }
        this.pushSymbol({ symbol: ',', advance: false });
        this.tokenizer.advance();
      } while (true);
    }
    this.output.push('</expressionList>');
    this.currentMethod.pop();
  }

  /**
   * Compiles an if statement, possibly with a trailing else clause
   * 'if' '(' expression ')' '{' statements '}'
   * ( 'else' '{' statements '}')?
   */
  public compileIf() {
    this.currentMethod.push('compileIf');
    this.output.push('<ifStatement>');
    // =========> if <==========
    this.pushKeyword({ advance: false });
    // =========> ( <==========
    this.pushSymbol({ symbol: '(' });
    // =========> expression <==========
    this.tokenizer.advance();
    this.compileExpression();
    // =========> ) <==========
    this.pushSymbol({ symbol: ')' });
    // =========> { <==========
    this.pushSymbol({ symbol: '{' });
    // =========> statements <==========
    // advance to the first keyword
    this.tokenizer.advance();
    this.compileStatements();
    // =========> { <==========
    this.pushSymbol({ symbol: '}', advance: false });
    // =========> else <==========
    this.tokenizer.advance();
    if (this.isKeyword() && this.tokenizer.keyWord() === 'else') {
      this.pushKeyword({ advance: false });
      // =========> { <==========
      this.pushSymbol({ symbol: '{' });
      // =========> statements <==========
      // advance to the first keyword
      this.tokenizer.advance();
      this.compileStatements();
      // =========> { <==========
      this.pushSymbol({ symbol: '}', advance: false });
      // advance one step
      this.tokenizer.advance();
    }
    this.output.push('</ifStatement>');
    this.currentMethod.pop();
  }

  /**
   * Compiles a while statement
   * 'while' '(' expression ')' '{' statements '}'
   */
  public compileWhile() {
    this.currentMethod.push('compileWhile');
    this.output.push('<whileStatement>');
    // =========> while <==========
    this.pushKeyword({ advance: false });
    // =========> ( <==========
    this.pushSymbol({ symbol: '(' });
    // =========> expression <==========
    this.tokenizer.advance();
    this.compileExpression();
    // =========> ) <==========
    this.pushSymbol({ symbol: ')' });
    // =========> { <==========
    this.pushSymbol({ symbol: '{' });
    // =========> statements <==========
    // advance to the first keyword
    this.tokenizer.advance();
    this.compileStatements();
    // =========> { <==========
    this.pushSymbol({ symbol: '}', advance: false });
    this.output.push('</whileStatement>');
    this.currentMethod.pop();
  }

  /**
   * Compiles a return statement
   * 'return' expression? ';'
   */
  public compileReturn() {
    this.currentMethod.push('compileReturn');
    this.output.push('<returnStatement>');
    // =========> return <==========
    this.pushKeyword({ advance: false });
    this.tokenizer.advance();
    // =========> expression? <==========
    if (!this.isSymbol()) {
      this.compileExpression();
      this.tokenizer.advance();
    }
    // =========> ; <==========
    this.pushSymbol({ symbol: ';', advance: false });
    this.output.push('</returnStatement>');
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
    this.output.push('<subroutineBody>');
    // =========> { <========
    this.pushSymbol({ symbol: '{' });
    // =========> varDec* <========
    do {
      this.tokenizer.advance();
      // keyword var has to be detected
      if (!this.isKeyword() || this.getWord() !== 'var') {
        break;
      }
      this.compileVarDec();
    } while (true);
    // =========> statements <========
    this.compileStatements();
    // =========> } <========
    this.pushSymbol({ symbol: '}', advance: false });
    this.output.push('</subroutineBody>');
    this.currentMethod.pop();
  }

  private isOperand(): boolean {
    const ops: string[] = ['+', '-', '/', '*', '%', '&', '|', '<', '>', '='];
    const symbol: string = this.tokenizer.symbol();
    return ops.indexOf(symbol) !== -1;
  }

  private isUnaryOp(): boolean {
    const ops: string[] = ['~', '-'];
    const symbol: string = this.tokenizer.symbol();
    return ops.indexOf(symbol) !== -1;
  }

  private isKeywordConstant(): boolean {
    const constants: string[] = ['this', 'null', 'true', 'false'];
    const keyword: string = this.tokenizer.keyWord();
    return constants.indexOf(keyword) !== -1;
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
        )}, but found:${this.translateType(
          found,
        )}, and found word: ${this.getWord()}`,
      );
    }
  }

  private reportKeywordError(expected: string) {
    const word: string = this.getWord();
    if (word !== expected) {
      throw new Error(
        `In method: ${this.getCurrentMethod()}, Expected keyword: ${expected}, but found word: ${word}`,
      );
    }
  }

  private reportKeywordsError(expecteds: string[]) {
    const word: string = this.getWord();
    if (expecteds.indexOf(word) === -1) {
      throw new Error(
        `In method: ${this.getCurrentMethod()}, Expected keyword in: ${expecteds}, but found word: ${word}`,
      );
    }
  }

  private reportSymbolError(expected: string) {
    const word: string = this.getWord();
    if (word !== expected) {
      throw new Error(
        `In method: ${this.getCurrentMethod()}, Expected symbol: ${expected}, but found word: ${word}`,
      );
    }
  }

  private reportSymbolsError(expecteds: string[]) {
    const word: string = this.getWord();
    if (expecteds.indexOf(word) === -1) {
      throw new Error(
        `In method: ${this.getCurrentMethod()}, Expected symbol in: ${expecteds}, but found word: ${word}`,
      );
    }
  }

  private pushIntegerConstant({ advance = true }: { advance?: boolean }) {
    if (advance) {
      this.tokenizer.advance();
    }
    this.reportTypeError(JackTokenizer.TYPE_INT_CONST);
    this.output.push(
      `<integerConstant>${this.tokenizer.intVal()}</integerConstant>`,
    );
  }

  private pushStringConstant({ advance = true }: { advance?: boolean }) {
    if (advance) {
      this.tokenizer.advance();
    }
    this.reportTypeError(JackTokenizer.TYPE_STRING_CONST);
    this.output.push(
      `<stringConstant>${this.tokenizer.intVal()}</stringConstant>`,
    );
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

  private getWord(): any {
    switch (this.tokenizer.tokenType()) {
      case JackTokenizer.TYPE_KEYWORD:
        return this.tokenizer.keyWord();
      case JackTokenizer.TYPE_SYMBOL:
        return this.tokenizer.symbol();
      case JackTokenizer.TYPE_IDENTIFIER:
        return this.tokenizer.identifier();
      case JackTokenizer.TYPE_INT_CONST:
        return this.tokenizer.intVal();
      case JackTokenizer.TYPE_STRING_CONST:
        return this.tokenizer.stringVal();
      default:
        return '';
    }
  }

  private isKeyword(): boolean {
    return this.tokenizer.tokenType() === JackTokenizer.TYPE_KEYWORD;
  }

  private isSymbol(): boolean {
    return this.tokenizer.tokenType() === JackTokenizer.TYPE_SYMBOL;
  }

  private isIdentifier(): boolean {
    return this.tokenizer.tokenType() === JackTokenizer.TYPE_IDENTIFIER;
  }

  private isIntegerConstant(): boolean {
    return this.tokenizer.tokenType() === JackTokenizer.TYPE_INT_CONST;
  }

  private isStringConstant(): boolean {
    return this.tokenizer.tokenType() === JackTokenizer.TYPE_STRING_CONST;
  }
}

export default CompilationEngine;
