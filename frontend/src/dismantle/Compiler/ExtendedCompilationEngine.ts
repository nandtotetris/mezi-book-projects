import GenericStack from 'dismantle/Common/GenericStack';
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
  KW_VOID_STR,
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
import VMWriter from 'dismantle/Compiler/VMWriter';
import HVMInstructionSet from 'dismantle/VirtualMachine/HVMInstructionSet';

class ExtendedCompilationEngine {
  private tokenizer: JackTokenizer;
  private output: string[] = [];
  private currentMethod: string[] = [];
  private symbolTable: SymbolTable;
  private vmWriter: VMWriter;
  private xmlMode: boolean = false;

  private whileLabelCount: number = -1;
  private ifLabelCount: number = -1;

  // the name of the class being compiled currently
  private className: string = '';
  // name of current subroutine being compiled
  private subroutineName: string = '';
  // stores at the top the number of arguments when calling the most recent subroutine
  private numArgumentsStack: number[] = [];
  // is the return type of the current subroutine void?
  private isVoid: boolean = false;
  private routineType: string = KW_FUNCTION_STR;

  /**
   * Creates a new compilation engine with the given input
   * and output.
   * The next routine called must be compileClass()
   * @param input
   * @param output
   */
  constructor(input: string, output: string = 'output') {
    this.tokenizer = new JackTokenizer(input);
    this.symbolTable = new SymbolTable();
    this.vmWriter = new VMWriter();
    this.compileClass();
  }

  /**
   * 'class' className '{' classVarDec* subroutineDec* '}'
   */
  public compileClass() {
    this.currentMethod.push('compileClass');
    this.pushTag('<class>');
    // ========> class <===========
    this.pushKeyword({ keyword: KW_CLASS_STR });
    // ========> className <==========
    this.tokenizer.advance();
    this.pushIdentifier({
      advance: false,
      isClassOrSubroutineDec: true,
      type: 'class_declaration',
    });
    this.className = this.tokenizer.identifier();
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
    this.pushTag('</class>');
    this.currentMethod.pop();
  }

  /**
   * Compiles a static declaration or a field declaration
   * ('static' | 'field') type varName(',' varName)* ';'
   */
  public compileClassVarDec() {
    this.currentMethod.push('compileClassVarDec');
    this.pushTag('<classVarDec>');
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
    this.pushTag('</classVarDec>');
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
    this.pushTag('<subroutineDec>');
    // reset subroutine symbol table
    this.symbolTable.startSubroutine();
    this.whileLabelCount = -1;
    this.ifLabelCount = -1;
    // ==========> constructor | function | method <========
    this.pushKeyword({
      advance: false,
      keywords: [KW_CONSTRUCTOR_STR, KW_FUNCTION_STR, KW_METHOD_STR],
    });
    // set routine type
    this.routineType = this.tokenizer.keyWord();
    if (this.routineType === KW_METHOD_STR) {
      this.symbolTable.define(KW_THIS_STR, this.className, IDENTIFIER_KIND.ARG);
    }
    // is it void or not?
    this.isVoid = false;
    // ========> void | type <=========
    this.tokenizer.advance();
    if (this.isKeyword()) {
      // void or keyword type
      if (this.tokenizer.keyWord() === KW_VOID_STR) {
        this.isVoid = true;
      }
      this.pushKeyword({ advance: false });
    } else {
      // user-defined type
      this.pushIdentifier({
        advance: false,
        isType: true,
      });
    }
    // =======> subroutineName <========
    this.tokenizer.advance();
    this.pushIdentifier({
      advance: false,
      isClassOrSubroutineDec: true,
      type: this.routineType,
    });
    this.subroutineName = this.tokenizer.identifier();
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
    this.pushTag('</subroutineDec>');
    this.currentMethod.pop();
  }

  /**
   * Compiles a (possibly empty) parameter list, not including the enclosing ()
   * ( (type varName) (',' type varName)* )?
   */
  public compileParameterList() {
    this.currentMethod.push('compileParameterList');
    this.pushTag('<parameterList>');
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
    this.pushTag('</parameterList>');
    this.currentMethod.pop();
  }

  /**
   * compiles a var declaration
   * 'var' type varName (',' varName)* ;
   */
  public compileVarDec() {
    this.currentMethod.push('compileVarDec');
    // <varDec>
    this.pushTag('<varDec>');
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
    this.pushTag('</varDec>');
    this.currentMethod.pop();
  }

  /**
   * Compiles a sequence of statements, not including the enclosing {}
   */
  public compileStatements() {
    this.currentMethod.push('compileStatements');
    this.pushTag('<statements>');
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
        // push 0 in case of void subroutines
        if (this.isVoid) {
          this.vmWriter.writePush(HVMInstructionSet.CONST_SEGMENT_CODE, 0);
        }
        this.compileReturn();
      } else {
        break;
      }
    }
    this.pushTag('</statements>');
    this.currentMethod.pop();
  }

  /**
   * Compiles a let statement
   * 'let' varName ('[' expression ']')? '=' expression ';'
   */
  public compileLet() {
    this.currentMethod.push('compileLet');
    this.pushTag('<letStatement>');
    // =======> let <=========
    this.pushKeyword({ advance: false });
    // =======> varName <=========
    this.tokenizer.advance();
    this.pushIdentifier({
      advance: false,
      isDefined: true,
    });
    const variable = this.tokenizer.identifier();
    let isArray: boolean = false;
    // next has to be a symbol, either [ or =
    this.tokenizer.advance();
    // =======> ('[' expression ']')? <=========
    this.reportTypeError(JackTokenizer.TYPE_SYMBOL);
    const symbol: string = this.tokenizer.symbol();
    if (symbol === SYM_SQUARE_OPEN_STR) {
      isArray = true;
      this.pushSymbol({ symbol: SYM_SQUARE_OPEN_STR, advance: false });
      // push expression
      this.tokenizer.advance();
      this.compileExpression();
      // push arr
      this.pushFromVariable(variable);
      // ]
      this.pushSymbol({ symbol: SYM_SQUARE_CLOSE_STR, advance: false });
      // add
      this.pushOperator(SYM_PLUS_STR);
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
    // transfer result to variable
    if (!isArray) {
      this.popIntoVariable(variable);
    } else {
      // temp 0 = value of expression right
      this.vmWriter.writePop(HVMInstructionSet.TEMP_SEGMENT_CODE, 0);
      // pop pointer 1, that = expression
      this.vmWriter.writePop(HVMInstructionSet.POINTER_SEGMENT_CODE, 1);
      // push temp 0
      this.vmWriter.writePush(HVMInstructionSet.TEMP_SEGMENT_CODE, 0);
      // pop that 0
      this.vmWriter.writePop(HVMInstructionSet.THAT_SEGMENT_CODE, 0);
    }
    // advance over this statement
    this.tokenizer.advance();
    this.pushTag('</letStatement>');
    this.currentMethod.pop();
  }

  /**
   * Compiles expression
   * term (op term)*
   */
  public compileExpression() {
    this.currentMethod.push('compileExpression');
    this.pushTag('<expression>');
    // ============> term <=========
    this.compileTerm();
    // ============> (op term)* <=========
    while (true) {
      if (this.isOperator()) {
        // op
        this.pushSymbol({ advance: false });
        const operator = this.tokenizer.symbol();
        // term
        this.tokenizer.advance();
        this.compileTerm();
        // output 'op'
        this.pushOperator(operator);
      } else {
        break;
      }
    }
    this.pushTag('</expression>');
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
    this.pushTag('<term>');
    let advance: boolean = true;
    if (this.isIntegerConstant()) {
      // ============> integerConstant <=========
      this.pushIntegerConstant({ advance: false });
      // if expression is a number n: output 'push n'
      this.vmWriter.writePush(
        HVMInstructionSet.CONST_SEGMENT_CODE,
        this.tokenizer.intVal(),
      );
    } else if (this.isStringConstant()) {
      // ============> stringConstant <=========
      this.pushStringConstant({ advance: false });
      const value = this.tokenizer.stringVal();
      // create new string
      this.vmWriter.writePush(
        HVMInstructionSet.CONST_SEGMENT_CODE,
        value.length,
      );
      // this will push base address to stack top
      this.vmWriter.writeCall('String.new', 1);
      // append the chars by operating on the string reference
      for (const char of value) {
        this.vmWriter.writePush(
          HVMInstructionSet.CONST_SEGMENT_CODE,
          char.charCodeAt(0),
        );
        // 2 because this is a method call, the base address is the
        // first argument
        this.vmWriter.writeCall('String.appendChar', 2);
      }
    } else if (this.isKeywordConstant()) {
      // ============> keywordConstants <=========
      const keyword = this.tokenizer.keyWord();
      this.pushKeyword({ advance: false });
      if (keyword === KW_NULL_STR || keyword === KW_FALSE_STR) {
        this.vmWriter.writePush(HVMInstructionSet.CONST_SEGMENT_CODE, 0);
      } else if (keyword === KW_TRUE_STR) {
        this.vmWriter.writePush(HVMInstructionSet.CONST_SEGMENT_CODE, 0);
        this.vmWriter.writeArithmetic(HVMInstructionSet.NOT_CODE);
      } else if (keyword === KW_THIS_STR) {
        this.vmWriter.writePush(HVMInstructionSet.POINTER_SEGMENT_CODE, 0);
      } else {
        throw new Error(`Unknown keyword in expression: ${keyword}`);
      }
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
        const operator = this.tokenizer.symbol();
        this.tokenizer.advance();
        this.compileTerm();
        // output op
        if (operator === SYM_MINUS_STR) {
          this.vmWriter.writeArithmetic(HVMInstructionSet.NEGATE_CODE);
        } else if (operator === SYM_INVERT_STR) {
          this.vmWriter.writeArithmetic(HVMInstructionSet.NOT_CODE);
        } else {
          throw new Error(`Unknow unary operator: ${operator}`);
        }
        advance = false;
      } else {
        throw Error(
          `In compileTerm: Unexpected symbol: ${this.tokenizer.symbol()}, expected: ${this.tokenizer.peek()}`,
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
        // push arr
        const arrayName = this.tokenizer.identifier();
        this.pushSymbol({ symbol: SYM_SQUARE_OPEN_STR });
        this.tokenizer.advance();
        this.compileExpression();
        this.pushFromVariable(arrayName);
        // add
        this.pushOperator(SYM_PLUS_STR);
        // pop pointer 1
        this.vmWriter.writePop(HVMInstructionSet.POINTER_SEGMENT_CODE, 1);
        // push that 0
        this.vmWriter.writePush(HVMInstructionSet.THAT_SEGMENT_CODE, 0);
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
        // push variable to stack
        this.pushFromVariable(this.tokenizer.identifier());
      }
    } else {
      throw Error(`In compileTerm: Unknown term: ${this.getWord()}`);
    }
    if (advance) {
      this.tokenizer.advance();
    }
    this.pushTag('</term>');
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
    this.pushTag('<doStatement>');
    // =======> do <=============
    this.pushKeyword({ advance: false });
    // =======> subroutineCall <=============
    this.tokenizer.advance();
    this.compileSubroutineCall();
    // =======> ; <=============
    this.pushSymbol({ symbol: SYM_SEMICOLON_STR, advance: false });
    // advance over this statement
    this.tokenizer.advance();
    // pop the return value;
    this.vmWriter.writePop(HVMInstructionSet.TEMP_SEGMENT_CODE, 0);
    this.pushTag('</doStatement>');
    this.currentMethod.pop();
  }

  /**
   * Compiles a possibly empty list of expressions
   * (expression (',' expression)*)?
   */
  public compileExpressionList() {
    this.currentMethod.push('compileExpressionList');
    this.pushTag('<expressionList>');
    // if not starting with an identifier, we are dealing
    // with an empty expression list
    let numArguments = 0;
    if (this.getWord() !== SYM_PARENTH_CLOSE_STR) {
      while (true) {
        numArguments++;
        this.compileExpression();
        this.reportTypeError(JackTokenizer.TYPE_SYMBOL);
        if (this.tokenizer.symbol() === SYM_PARENTH_CLOSE_STR) {
          break;
        }
        this.pushSymbol({ symbol: SYM_COMMA_STR, advance: false });
        this.tokenizer.advance();
      }
    }
    this.numArgumentsStack.push(numArguments);
    this.pushTag('</expressionList>');
    this.currentMethod.pop();
  }

  /**
   * Compiles an if statement, possibly with a trailing else clause
   * 'if' '(' expression ')' '{' statements '}'
   * ( 'else' '{' statements '}')?
   */
  public compileIf() {
    this.currentMethod.push('compileIf');
    this.pushTag('<ifStatement>');
    // =========> if <==========
    this.pushKeyword({ advance: false });
    // =========> ( <==========
    this.pushSymbol({ symbol: SYM_PARENTH_OPEN_STR });
    // =========> expression <==========
    this.tokenizer.advance();
    this.compileExpression();
    // increment if label count
    this.ifLabelCount++;
    const labelCountStr = `${this.ifLabelCount}`;
    // if-goto IF_TRUE
    const labelTrue = `IF_TRUE${labelCountStr}`;
    this.vmWriter.writeIf(labelTrue);
    // goto IF_FALSE
    const labelFalse = `IF_FALSE${labelCountStr}`;
    this.vmWriter.writeGoto(labelFalse);
    // =========> ) <==========
    this.pushSymbol({ symbol: SYM_PARENTH_CLOSE_STR, advance: false });
    // =========> { <==========
    this.pushSymbol({ symbol: SYM_CURLY_OPEN_STR });
    // =========> statements <==========
    // IF_TRUE, execute statements
    this.vmWriter.writeLabel(labelTrue);
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
      // after statements, go to END
      const labelEnd = `IF_END${labelCountStr}`;
      this.vmWriter.writeGoto(labelEnd);
      // IF_FALSE
      this.vmWriter.writeLabel(labelFalse);
      // advance to the first keyword
      this.tokenizer.advance();
      this.compileStatements();
      // =========> { <==========
      this.pushSymbol({ symbol: SYM_CURLY_CLOSE_STR, advance: false });
      // advance one step
      this.tokenizer.advance();
      // END
      this.vmWriter.writeLabel(labelEnd);
    } else {
      // IF_FALSE
      this.vmWriter.writeLabel(labelFalse);
    }
    this.pushTag('</ifStatement>');
    this.currentMethod.pop();
  }

  /**
   * Compiles a while statement
   * 'while' '(' expression ')' '{' statements '}'
   */
  public compileWhile() {
    this.currentMethod.push('compileWhile');
    this.pushTag('<whileStatement>');
    this.whileLabelCount++;
    // WHILE_EXP
    const labelExp = `WHILE_EXP${this.whileLabelCount}`;
    this.vmWriter.writeLabel(labelExp);
    // =========> while <==========
    this.pushKeyword({ advance: false });
    // =========> ( <==========
    this.pushSymbol({ symbol: SYM_PARENTH_OPEN_STR });
    // =========> expression <==========
    this.tokenizer.advance();
    this.compileExpression();
    // =========> ) <==========
    this.pushSymbol({ symbol: SYM_PARENTH_CLOSE_STR, advance: false });
    // not
    this.vmWriter.writeArithmetic(HVMInstructionSet.NOT_CODE);
    // if-goto label END
    const labelEnd = `WHILE_END${this.whileLabelCount}`;
    this.vmWriter.writeIf(labelEnd);
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
    // goto WHILE_EXP
    this.vmWriter.writeGoto(labelExp);
    // END
    this.vmWriter.writeLabel(labelEnd);
    this.pushTag('</whileStatement>');
    this.currentMethod.pop();
  }

  /**
   * Compiles a return statement
   * 'return' expression? ';'
   */
  public compileReturn() {
    this.currentMethod.push('compileReturn');
    this.pushTag('<returnStatement>');
    // =========> return <==========
    this.pushKeyword({ advance: false });
    // =========> expression? <==========
    this.tokenizer.advance();
    if (this.getWord() !== SYM_SEMICOLON_STR) {
      this.compileExpression();
    }
    // =========> ; <==========
    this.pushSymbol({ symbol: SYM_SEMICOLON_STR, advance: false });
    // advance over current statement
    this.tokenizer.advance();
    // write VM return command
    this.vmWriter.writeReturn();
    this.pushTag('</returnStatement>');
    this.currentMethod.pop();
  }

  /**
   * Not part of the official api, but gets the string
   * representation of the output
   */
  public getOutput(): string {
    if (this.xmlMode) {
      return this.output.join('\n');
    } else {
      return this.vmWriter.getOutput();
    }
  }

  /**
   * subroutineName'(' expressionList? ')' |
   * ( className | varName )'.'subroutineName'(' expressionList? ')'
   */
  private compileSubroutineCall() {
    const firstIdentifier = this.tokenizer.identifier();
    let isExternalMethodCall = false;
    let isInternalMethodCall = false;
    let subroutineName = firstIdentifier;

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
      this.tokenizer.advance();
      this.pushIdentifier({
        advance: false,
        isDefined: true,
      });
      // distinguish a method call
      isExternalMethodCall =
        this.symbolTable.kindOf(firstIdentifier) !== IDENTIFIER_KIND.NONE;
      if (isExternalMethodCall) {
        subroutineName = `${this.symbolTable.typeOf(
          firstIdentifier,
        )}.${this.tokenizer.identifier()}`;
      } else {
        subroutineName = `${firstIdentifier}.${this.tokenizer.identifier()}`;
      }
    } else {
      // ========> subroutineName <=======

      // check if it is a method of the current class, preceded with an implicit this
      isInternalMethodCall = true;
      subroutineName = `${this.className}.${firstIdentifier}`;

      this.pushIdentifier({
        advance: false,
        isDefined: true,
      });
    }
    if (isExternalMethodCall) {
      // push the address of the object
      this.pushFromVariable(firstIdentifier);
    }
    if (isInternalMethodCall) {
      // push the this address
      this.vmWriter.writePush(HVMInstructionSet.POINTER_SEGMENT_CODE, 0);
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
    let numArguments = this.numArgumentsStack.pop() || 0;
    // there is additional argument (the this object) for method calls
    if (isInternalMethodCall || isExternalMethodCall) {
      numArguments++;
    }
    // write function call through the VMWriter
    this.vmWriter.writeCall(subroutineName, numArguments);
  }

  /**
   * '{' varDec* statements '}'
   */
  private compileSubroutineBody() {
    this.currentMethod.push('compileSubroutineBody');
    this.pushTag('<subroutineBody>');
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
    // write function through the VMWriter, it is written here at the end of
    // the varDec* so number of local variables can be known
    const numLocalVars = this.symbolTable.varCount(IDENTIFIER_KIND.VAR);
    const fullFunctionName = `${this.className}.${this.subroutineName}`;
    this.vmWriter.writeFunction(fullFunctionName, numLocalVars);
    // handle object construction
    if (this.routineType === KW_CONSTRUCTOR_STR) {
      const fieldCount = this.symbolTable.varCount(IDENTIFIER_KIND.FIELD);
      // allocate required number of words
      this.vmWriter.writePush(HVMInstructionSet.CONST_SEGMENT_CODE, fieldCount);
      // one argument, Memory.alloc returns the base address
      this.vmWriter.writeCall('Memory.alloc', 1);
      // anchor this at the base address
      this.vmWriter.writePop(HVMInstructionSet.POINTER_SEGMENT_CODE, 0);
    } else if (this.routineType === KW_METHOD_STR) {
      // Associate the this memory segment with the object on which
      // the method operates
      this.vmWriter.writePush(HVMInstructionSet.ARG_SEGMENT_CODE, 0);
      this.vmWriter.writePop(HVMInstructionSet.POINTER_SEGMENT_CODE, 0);
    }
    // =========> statements <========
    this.compileStatements();
    // =========> } <========
    this.pushSymbol({ symbol: SYM_CURLY_CLOSE_STR, advance: false });
    this.tokenizer.advance();
    this.pushTag('</subroutineBody>');
    this.currentMethod.pop();
  }

  /**
   * Push a variable into the stack
   * @param variable the variable to push on to the stack
   */
  private pushFromVariable(variable: string) {
    const kind = this.symbolTable.kindOf(variable);
    const segmentCode = this.getSegmentOfKind(kind);
    const segmentIndex = this.symbolTable.indexOf(variable);
    this.vmWriter.writePush(segmentCode, segmentIndex);
  }

  /**
   * Popos stack top value and stores into address pointed by
   * variable
   * @param variable the variable to hold stack top value
   */
  private popIntoVariable(variable: string) {
    const kind = this.symbolTable.kindOf(variable);
    const segmentCode = this.getSegmentOfKind(kind);
    const segmentIndex = this.symbolTable.indexOf(variable);
    this.vmWriter.writePop(segmentCode, segmentIndex);
  }

  private pushOperator(operator: string) {
    let operatorCode: number = -1;
    switch (operator) {
      case SYM_PLUS_STR:
        operatorCode = HVMInstructionSet.ADD_CODE;
        break;
      case SYM_MINUS_STR:
        operatorCode = HVMInstructionSet.SUBSTRACT_CODE;
        break;
      case SYM_MULTIPLY_STR:
        this.vmWriter.writeCall('Math.multiply', 2);
        return;
      case SYM_DIVIDE_STR:
        this.vmWriter.writeCall('Math.divide', 2);
        return;
      case SYM_AND_STR:
        operatorCode = HVMInstructionSet.AND_CODE;
        break;
      case SYM_OR_STR:
        operatorCode = HVMInstructionSet.OR_CODE;
        break;
      case SYM_INVERT_STR:
        operatorCode = HVMInstructionSet.NOT_CODE;
        break;
      case SYM_LESS_STR:
        operatorCode = HVMInstructionSet.LESS_THAN_CODE;
        break;
      case SYM_GREATER_STR:
        operatorCode = HVMInstructionSet.GREATER_THAN_CODE;
        break;
      case SYM_EQUAL_STR:
        operatorCode = HVMInstructionSet.EQUAL_CODE;
        break;
      default:
        break;
    }
    this.vmWriter.writeArithmetic(operatorCode);
  }

  private getSegmentOfKind(kind: IDENTIFIER_KIND): number {
    switch (kind) {
      case IDENTIFIER_KIND.STATIC:
        return HVMInstructionSet.STATIC_SEGMENT_CODE;
      case IDENTIFIER_KIND.FIELD:
        return HVMInstructionSet.THIS_SEGMENT_CODE;
      case IDENTIFIER_KIND.ARG:
        return HVMInstructionSet.ARG_SEGMENT_CODE;
      case IDENTIFIER_KIND.VAR:
        return HVMInstructionSet.LOCAL_SEGMENT_CODE;
      default:
        throw Error(
          `In method getSegementOfKind, Invalid kind ${kind} for segment selection`,
        );
    }
  }

  private isOperator(value?: string): boolean {
    const ops: string[] = [
      SYM_PLUS_STR,
      SYM_MINUS_STR,
      SYM_DIVIDE_STR,
      SYM_MULTIPLY_STR,
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
    this.pushTag(
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
    this.pushTag(
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
    if (!this.xmlMode) {
      return;
    }
    const escapedSymbols: any = {
      '"': '&quot;',
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
    };
    let value: string = this.tokenizer.symbol();
    if (escapedSymbols[value] !== undefined) {
      value = escapedSymbols[value];
    }
    this.pushTag(`<symbol>${value}</symbol>`);
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
    this.pushTag(`<keyword>${this.tokenizer.keyWord()}</keyword>`);
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
      this.tokenizer.advance();
    }
    this.reportTypeError(JackTokenizer.TYPE_IDENTIFIER);
    const identifier = this.tokenizer.identifier();
    if (!this.xmlMode) {
      if (isType || isClassOrSubroutineDec) {
        return;
      }
      if (!isDefined) {
        this.symbolTable.define(identifier, type, kind);
      } else {
        kind = this.symbolTable.kindOf(identifier);
        // if type is not found in the symbol table, take whatever
        // is handed in
        type = this.symbolTable.typeOf(identifier) || type;
      }
    } else {
      this.pushTag(`<identifier>${identifier}</identifier>`);
    }
  }

  private pushTag(tag: string) {
    if (this.xmlMode) {
      this.output.push(tag);
    }
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
