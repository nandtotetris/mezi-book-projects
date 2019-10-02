import JackTokenizer, {
  KW_BOOLEAN_STR,
  KW_CHAR_STR,
  KW_CLASS_STR,
  KW_CONSTRUCTOR_STR,
  KW_DO_STR,
  KW_ELSE_STR,
  KW_FALSE_STR,
  KW_FIELD_STR,
  KW_FUNCTION_STR,
  KW_IF_STR,
  KW_INT_STR,
  KW_LET_STR,
  KW_METHOD_STR,
  KW_NULL_STR,
  KW_RETURN_STR,
  KW_STATIC_STR,
  KW_THIS_STR,
  KW_TRUE_STR,
  KW_VAR_STR,
  KW_WHILE_STR,
  SYM_AND_STR,
  SYM_COMMA_STR,
  SYM_CURLY_CLOSE_STR,
  SYM_CURLY_OPEN_STR,
  SYM_DIVIDE_STR,
  SYM_DOT_STR,
  SYM_EQUAL_STR,
  SYM_GREATER_STR,
  SYM_INVERT_STR,
  SYM_LESS_STR,
  SYM_MINUS_STR,
  SYM_MULTIPLY_STR,
  SYM_OR_STR,
  SYM_PARENTH_CLOSE_STR,
  SYM_PARENTH_OPEN_STR,
  SYM_PLUS_STR,
  SYM_REMAINDER_STR,
  SYM_SEMICOLON_STR,
  SYM_SQUARE_CLOSE_STR,
  SYM_SQUARE_OPEN_STR,
} from 'dismantle/Compiler/JackTokenizer';
import SymbolTable, {
  ARGUMENT_STR,
  IDENTIFIER_KIND,
  kindCodeToStr,
  kindStrToCode,
  SUBROUTINE_STR,
} from 'dismantle/Compiler/SymbolTable';
import Tokenizr from 'tokenizr';

class ExtendedCompilationEngine {
  private tokenizer: JackTokenizer;
  private output: string[] = [];
  private currentMethod: string[] = [];
  private symbolTable: SymbolTable;

  /**
   * Creates a new compilation engine with the given input
   * and output.
   * The next routine called must be compileClass()
   * @param input
   * @param output
   */
  constructor(input: string, output: string) {
    this.tokenizer = new JackTokenizer(input);
    this.symbolTable = new SymbolTable();
    this.compileClass();
  }

  /**
   * 'class' className '{' classVarDec* subroutineDec* '}'
   */
  public compileClass() {
    this.currentMethod.push('compileClass');
    this.output.push('<class>');
    // ========> class <===========
    this.pushKeyword({ keyword: KW_CLASS_STR });
    // ========> className <==========
    this.pushIdentifier({
      isClassOrSubroutineDec: true,
      type: 'class_declaration',
    });
    // ========> { <==========
    this.pushSymbol({ symbol: SYM_CURLY_OPEN_STR });
    // classVarDec, subRoutineDec, or }
    this.tokenizer.advance();
    // both classVarDec and subRoutineDec start with a keyword
    if (this.isKeyword()) {
      let keyword: string;
      // =========> classVarDec* <============
      while (true) {
        // if not keyword, it must be the class end symbol
        // this check is irrelevant for the first iteration
        if (!this.isKeyword()) {
          break;
        }
        keyword = this.tokenizer.keyWord();
        if (keyword !== KW_STATIC_STR && keyword !== KW_FIELD_STR) {
          // not a classVarDec, so must be a subRoutineDec, exit the loop
          break;
        }
        this.compileClassVarDec();
      }
      // ============> compileRoutineDec* <===============
      while (true) {
        // if not keyword, it is the class end symbol }, so break off the loop
        if (!this.isKeyword()) {
          break;
        }
        keyword = this.tokenizer.keyWord();
        if (
          keyword !== KW_CONSTRUCTOR_STR &&
          keyword !== KW_FUNCTION_STR &&
          keyword !== KW_METHOD_STR
        ) {
          break;
        }
        this.compileSubroutine();
      }
    }
    // ==========> } <==========
    this.pushSymbol({ symbol: SYM_CURLY_CLOSE_STR, advance: false });
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
    this.output.push('<classVarDec>');
    // =======> static | field <=========
    this.pushKeyword({
      advance: false,
      keywords: [KW_STATIC_STR, KW_FIELD_STR],
    });
    const kind = kindStrToCode(this.tokenizer.keyWord());
    // =======> type <========
    this.tokenizer.advance();
    let type: string;
    if (this.isKeyword()) {
      // primitive type
      this.pushKeyword({ advance: false });
      type = this.tokenizer.keyWord();
    } else {
      // user-defined type
      this.pushIdentifier({
        advance: false,
        isType: true,
      });
      type = this.tokenizer.identifier();
    }
    while (true) {
      // ==========> varName <========
      this.pushIdentifier({
        kind,
        type,
      });
      // ==========> , or ; <=========
      this.pushSymbol({ symbols: [SYM_COMMA_STR, SYM_SEMICOLON_STR] });
      if (this.tokenizer.symbol() === SYM_SEMICOLON_STR) {
        break;
      }
    }
    // advance over the current classVarDec
    this.tokenizer.advance();
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
    this.output.push('<subroutineDec>');
    // reset subroutine symbol table
    this.symbolTable.startSubroutine();
    // ==========> constructor | function | method <========
    this.pushKeyword({
      advance: false,
      keywords: [KW_CONSTRUCTOR_STR, KW_FUNCTION_STR, KW_METHOD_STR],
    });
    // ========> void | type <=========
    this.tokenizer.advance();
    if (this.isKeyword()) {
      // void or keyword type
      this.pushKeyword({ advance: false });
    } else {
      // user-defined type
      this.pushIdentifier({
        advance: false,
        isType: true,
      });
    }
    // =======> subroutineName <========
    this.pushIdentifier({
      isClassOrSubroutineDec: true,
      type: 'subroutine_declaration',
    });
    // =======> ( <========
    this.pushSymbol({ symbol: SYM_PARENTH_OPEN_STR });
    // =======> parameterList <========
    this.tokenizer.advance();
    this.compileParameterList();
    // =======> ) <=======
    this.pushSymbol({ symbol: SYM_PARENTH_CLOSE_STR, advance: false });
    // ========> subroutineBody <=======
    this.tokenizer.advance();
    // this method should advance just over the subroutine
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
    // parameter list can not start with a symbol, if symbol
    // we are dealing with an empty parameter list, and we have
    // already advanced over it

    if (!this.isSymbol()) {
      let type: string;
      while (true) {
        // ========> type <======
        if (this.isKeyword()) {
          // keywords like: int, char, boolean
          this.pushKeyword({ advance: false });
          type = this.tokenizer.keyWord();
        } else {
          this.pushIdentifier({
            advance: false,
            isType: true,
          });
          type = this.tokenizer.identifier();
        }
        // =========> varName <=========
        this.pushIdentifier({
          kind: IDENTIFIER_KIND.ARG,
          type,
        });
        // ========> , <===========
        this.tokenizer.advance();
        this.reportTypeError(JackTokenizer.TYPE_SYMBOL);
        const symbol: string = this.tokenizer.symbol();
        if (symbol !== SYM_COMMA_STR) {
          // if not comma, then we have advanced beyond the parameter list
          break;
        }
        // push the comma
        this.pushSymbol({ advance: false });
        // go to next possible parameter
        this.tokenizer.advance();
      }
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
    this.pushKeyword({ advance: false, keyword: KW_VAR_STR });
    // ======> type <=======
    this.tokenizer.advance();
    let type: string;
    if (this.isKeyword()) {
      this.pushKeyword({ advance: false });
      type = this.tokenizer.keyWord();
    } else {
      this.pushIdentifier({
        advance: false,
        isType: true,
      });
      type = this.tokenizer.identifier();
    }
    while (true) {
      // ======> varName <=======
      this.pushIdentifier({
        kind: IDENTIFIER_KIND.VAR,
        type,
      });
      // ======> , or ; <=======
      this.pushSymbol({ symbols: [SYM_COMMA_STR, SYM_SEMICOLON_STR] });
      if (this.tokenizer.symbol() === SYM_SEMICOLON_STR) {
        break;
      }
    }
    // advance over the current varDec
    this.tokenizer.advance();
    // </varDec>
    this.output.push('</varDec>');
    this.currentMethod.pop();
  }

  /**
   * Compiles a sequence of statements, not including the enclosing {}
   */
  public compileStatements() {
    this.currentMethod.push('compileStatements');
    this.output.push('<statements>');
    let keyword: string;
    while (true) {
      // statements stop upon discovery of a symbol, possibly }
      if (!this.isKeyword()) {
        break;
      }
      keyword = this.tokenizer.keyWord();
      if (keyword === KW_LET_STR) {
        this.compileLet();
      } else if (keyword === KW_DO_STR) {
        this.compileDo();
      } else if (keyword === KW_WHILE_STR) {
        this.compileWhile();
      } else if (keyword === KW_IF_STR) {
        this.compileIf();
      } else if (keyword === KW_RETURN_STR) {
        this.compileReturn();
      } else {
        break;
      }
    }
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
    this.pushIdentifier({
      isDefined: true,
    });
    // next has to be a symbol, either [ or =
    this.tokenizer.advance();
    // =======> ('[' expression ']')? <=========
    this.reportTypeError(JackTokenizer.TYPE_SYMBOL);
    const symbol: string = this.tokenizer.symbol();
    if (symbol === SYM_SQUARE_OPEN_STR) {
      this.pushSymbol({ symbol: SYM_SQUARE_OPEN_STR, advance: false });
      // expression
      this.tokenizer.advance();
      this.compileExpression();
      // ]
      this.pushSymbol({ symbol: SYM_SQUARE_CLOSE_STR, advance: false });
      // advance for =
      this.tokenizer.advance();
    } else if (symbol !== SYM_EQUAL_STR) {
      throw Error(`In method compileLet, invalid symbol: ${symbol}`);
    }
    // ============> = <=========
    this.pushSymbol({ symbol: SYM_EQUAL_STR, advance: false });
    // ============> expression <=========
    this.tokenizer.advance();
    this.compileExpression();
    // ============> ; <=========
    this.pushSymbol({ symbol: SYM_SEMICOLON_STR, advance: false });
    // advance over this statement
    this.tokenizer.advance();
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
    // ============> term <=========
    this.compileTerm();
    // ============> (op term)* <=========
    while (true) {
      if (this.isOperand()) {
        // op
        this.pushSymbol({ advance: false });
        // term
        this.tokenizer.advance();
        this.compileTerm();
      } else {
        break;
      }
    }
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
    let advance: boolean = true;
    if (this.isIntegerConstant()) {
      // ============> integerConstant <=========
      this.pushIntegerConstant({ advance: false });
    } else if (this.isStringConstant()) {
      // ============> stringConstant <=========
      this.pushStringConstant({ advance: false });
    } else if (this.isKeywordConstant()) {
      // ============> keywordConstants <=========
      this.pushKeyword({ advance: false });
    } else if (this.isSymbol()) {
      if (this.tokenizer.symbol() === SYM_PARENTH_OPEN_STR) {
        // ============> (expression) <=========
        this.pushSymbol({ advance: false });
        this.tokenizer.advance();
        this.compileExpression();
        this.pushSymbol({ symbol: SYM_PARENTH_CLOSE_STR, advance: false });
      } else if (this.isUnaryOp()) {
        // ============> unaryOp term <=========
        this.pushSymbol({ advance: false });
        this.tokenizer.advance();
        this.compileTerm();
        advance = false;
      } else {
        throw Error(
          `In compileTerm: Unexpected symbol: ${this.tokenizer.symbol()}`,
        );
      }
    } else if (this.isIdentifier()) {
      // peek into the next symbol to distnguish between an array expression,
      // a subroutine call, and a plain variable name
      const word: string = this.tokenizer.peek();
      if (word === SYM_SQUARE_OPEN_STR) {
        // ============> varName[expression] <=========
        this.pushIdentifier({
          advance: false,
          isDefined: true,
          type: 'Array',
        });
        this.pushSymbol({ symbol: SYM_SQUARE_OPEN_STR });
        this.tokenizer.advance();
        this.compileExpression();
        this.pushSymbol({ symbol: SYM_SQUARE_CLOSE_STR, advance: false });
      } else if (word === SYM_PARENTH_OPEN_STR || word === SYM_DOT_STR) {
        // ============> subroutineCall <=========
        this.compileSubroutineCall();
        advance = false;
      } else {
        // ============> varName <=========
        this.pushIdentifier({
          advance: false,
          isDefined: true,
        });
      }
    } else {
      throw Error(`In compileTerm: Unknown term: ${this.getWord()}`);
    }
    if (advance) {
      this.tokenizer.advance();
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
    this.tokenizer.advance();
    this.compileSubroutineCall();
    // =======> ; <=============
    this.pushSymbol({ symbol: SYM_SEMICOLON_STR, advance: false });
    // advance over this statement
    this.tokenizer.advance();
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
    // if not starting with an identifier, we are dealing
    // with an empty expression list
    if (this.getWord() !== SYM_PARENTH_CLOSE_STR) {
      while (true) {
        this.compileExpression();
        this.reportTypeError(JackTokenizer.TYPE_SYMBOL);
        if (this.tokenizer.symbol() === SYM_PARENTH_CLOSE_STR) {
          break;
        }
        this.pushSymbol({ symbol: SYM_COMMA_STR, advance: false });
        this.tokenizer.advance();
      }
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
    this.pushSymbol({ symbol: SYM_PARENTH_OPEN_STR });
    // =========> expression <==========
    this.tokenizer.advance();
    this.compileExpression();
    // =========> ) <==========
    this.pushSymbol({ symbol: SYM_PARENTH_CLOSE_STR, advance: false });
    // =========> { <==========
    this.pushSymbol({ symbol: SYM_CURLY_OPEN_STR });
    // =========> statements <==========
    // advance to the first keyword
    this.tokenizer.advance();
    this.compileStatements();
    // =========> { <==========
    this.pushSymbol({ symbol: SYM_CURLY_CLOSE_STR, advance: false });
    // =========> else <==========
    this.tokenizer.advance();
    if (this.isKeyword() && this.tokenizer.keyWord() === KW_ELSE_STR) {
      this.pushKeyword({ advance: false });
      // =========> { <==========
      this.pushSymbol({ symbol: SYM_CURLY_OPEN_STR });
      // =========> statements <==========
      // advance to the first keyword
      this.tokenizer.advance();
      this.compileStatements();
      // =========> { <==========
      this.pushSymbol({ symbol: SYM_CURLY_CLOSE_STR, advance: false });
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
    this.pushSymbol({ symbol: SYM_PARENTH_OPEN_STR });
    // =========> expression <==========
    this.tokenizer.advance();
    this.compileExpression();
    // =========> ) <==========
    this.pushSymbol({ symbol: SYM_PARENTH_CLOSE_STR, advance: false });
    // =========> { <==========
    this.pushSymbol({ symbol: SYM_CURLY_OPEN_STR });
    // =========> statements <==========
    // advance to the first keyword
    this.tokenizer.advance();
    this.compileStatements();
    // =========> { <==========
    this.pushSymbol({ symbol: SYM_CURLY_CLOSE_STR, advance: false });
    // advance over this statement
    this.tokenizer.advance();
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
    // =========> expression? <==========
    this.tokenizer.advance();
    if (!this.isSymbol()) {
      this.compileExpression();
    }
    // =========> ; <==========
    this.pushSymbol({ symbol: SYM_SEMICOLON_STR, advance: false });
    // advance over current statement
    this.tokenizer.advance();
    this.output.push('</returnStatement>');
    this.currentMethod.pop();
  }

  public getXmlOutput(): string {
    return this.output.join('\n');
  }

  /**
   * subroutineName'(' expressionList? ')' |
   * ( className | varName )'.'subroutineName'(' expressionList? ')'
   */
  private compileSubroutineCall() {
    // peek into the next value to distinguish between
    // a subroutineName and a className/varName
    const nextWord: string = this.tokenizer.peek();
    // this.reportTypeError(JackTokenizer.TYPE_SYMBOL);
    // const symbol: string = this.tokenizer.symbol();
    if (nextWord === SYM_DOT_STR) {
      // ========> varName/className <==========
      // you distinguish between them by doing a symbol table look up.
      // If found in symbol table, then it is a varName ... so you can
      // safely assume that it is a class name, because if not it will be
      // found in the symbol table, and will get the type of its class
      this.pushIdentifier({
        advance: false,
        isDefined: true,
        type: 'class',
      });
      // ========> . <=======
      this.pushSymbol({ symbol: SYM_DOT_STR });
      // ========> subroutineName <=======
      // assuming this is a method, since it is preceded with
      // the dot operator
      this.pushIdentifier({
        isDefined: true,
        type: 'method',
      });
    } else {
      // ========> subroutineName <=======
      // assuming this is a function, since it lacks a preceding
      // dot operator
      this.pushIdentifier({
        advance: false,
        isDefined: true,
        type: 'function',
      });
    }
    // ========> ( <=======
    this.pushSymbol({ symbol: SYM_PARENTH_OPEN_STR });
    this.tokenizer.advance();
    // ========> expressionList <=======
    this.compileExpressionList();
    // ========> ) <=======
    this.pushSymbol({ symbol: SYM_PARENTH_CLOSE_STR, advance: false });
    // advance over the subroutineCall
    this.tokenizer.advance();
  }

  /**
   * '{' varDec* statements '}'
   */
  private compileSubroutineBody() {
    this.currentMethod.push('compileSubroutineBody');
    this.output.push('<subroutineBody>');
    // =========> { <========
    this.pushSymbol({ symbol: SYM_CURLY_OPEN_STR, advance: false });
    // =========> varDec* <========
    this.tokenizer.advance();
    do {
      // keyword var has to be detected
      if (!this.isKeyword() || this.getWord() !== KW_VAR_STR) {
        break;
      }
      this.compileVarDec();
    } while (true);
    // =========> statements <========
    this.compileStatements();
    // =========> } <========
    this.pushSymbol({ symbol: SYM_CURLY_CLOSE_STR, advance: false });
    this.tokenizer.advance();
    this.output.push('</subroutineBody>');
    this.currentMethod.pop();
  }

  private isOperand(value?: string): boolean {
    const ops: string[] = [
      SYM_PLUS_STR,
      SYM_MINUS_STR,
      SYM_DIVIDE_STR,
      SYM_MULTIPLY_STR,
      SYM_REMAINDER_STR,
      SYM_AND_STR,
      SYM_OR_STR,
      SYM_LESS_STR,
      SYM_GREATER_STR,
      SYM_EQUAL_STR,
    ];
    if (value !== undefined) {
      return ops.indexOf(value) !== -1;
    }
    const symbol: string = this.tokenizer.symbol();
    return ops.indexOf(symbol) !== -1;
  }

  private isUnaryOp(): boolean {
    const ops: string[] = [SYM_INVERT_STR, SYM_MINUS_STR];
    const symbol: string = this.tokenizer.symbol();
    return ops.indexOf(symbol) !== -1;
  }

  private isKeywordConstant(): boolean {
    const constants: string[] = [
      KW_THIS_STR,
      KW_NULL_STR,
      KW_TRUE_STR,
      KW_FALSE_STR,
    ];
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

  private pushIntegerConstant(
    { advance }: { advance?: boolean } = { advance: true },
  ) {
    if (advance) {
      this.tokenizer.advance();
    }
    this.reportTypeError(JackTokenizer.TYPE_INT_CONST);
    this.output.push(
      `<integerConstant>${this.tokenizer.intVal()}</integerConstant>`,
    );
  }

  private pushStringConstant(
    { advance }: { advance?: boolean } = { advance: true },
  ) {
    if (advance) {
      this.tokenizer.advance();
    }
    this.reportTypeError(JackTokenizer.TYPE_STRING_CONST);
    this.output.push(
      `<stringConstant>${this.tokenizer.stringVal()}</stringConstant>`,
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
    // const escapedSymbols: any = {
    //   '"': '&quot;',
    //   '&': '&amp;',
    //   '<': '&lt;',
    //   '>': '&gt;',
    // };
    // let value: string = this.tokenizer.symbol();
    // if (escapedSymbols[value] !== undefined) {
    //   value = escapedSymbols[value];
    // }
    // this.output.push(`<symbol>${value}</symbol>`);
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
    // this.output.push(`<keyword>${this.tokenizer.keyWord()}</keyword>`);
  }

  private pushIdentifier(
    {
      advance = true,
      isClassOrSubroutineDec = false,
      isDefined = false,
      isType = false,
      kind = IDENTIFIER_KIND.NONE,
      type,
    }: {
      advance?: boolean;
      isClassOrSubroutineDec?: boolean;
      isDefined?: boolean;
      isType?: boolean;
      kind?: IDENTIFIER_KIND;
      type?: string;
    } = {
      advance: true,
      isClassOrSubroutineDec: false,
      isDefined: false,
      isType: false,
      kind: IDENTIFIER_KIND.NONE,
    },
  ) {
    if (advance) {
      // tslint:disable-next-line: no-console
      console.log('ADVANCED TO AN IDENTIFIER');
      this.tokenizer.advance();
    }
    this.reportTypeError(JackTokenizer.TYPE_IDENTIFIER);
    if (isType || isClassOrSubroutineDec) {
      return;
    }
    const identifier = this.tokenizer.identifier();
    kind = kind || IDENTIFIER_KIND.NONE;
    if (!isDefined) {
      this.symbolTable.define(identifier, type, kind);
    } else {
      kind = this.symbolTable.kindOf(identifier);
      // if type is not found in the symbol table, take whatever
      // is handed in
      type = this.symbolTable.typeOf(identifier) || type;
    }
    const isPrimitive: boolean =
      !!type && [KW_CHAR_STR, KW_INT_STR, KW_BOOLEAN_STR].indexOf(type) !== -1;
    const runningIndex = this.symbolTable.indexOf(identifier);
    // this.output.push(`<identifier>${identifier}</identifier>`);
    this.output.push('<identifier>');
    this.output.push(`<name>${identifier}</name>`);
    this.output.push(`<isDefined>${isDefined}</isDefined>`);
    this.output.push(`<isPrimitive>${isPrimitive}</isPrimitive>`);
    this.output.push(`<kind>${kindCodeToStr(kind)}</kind>`);
    this.output.push(`<type>${type}</type>`);
    this.output.push(`<index>${runningIndex}</index>`);
    this.output.push('</identifier>');
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

export default ExtendedCompilationEngine;
