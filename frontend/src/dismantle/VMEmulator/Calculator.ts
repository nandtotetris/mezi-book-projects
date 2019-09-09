import ComputerPartGUI from '../ComputerParts/ComputerPartGUI';
import ValueComputerPart from '../ComputerParts/ValueComputerPart';
import CalculatorGUI from './CalculatorGUI';
/**
 * A simple calculator, with two inputs, one output, and a set of operators.
 */
class Calculator extends ValueComputerPart {
  /**
   * The Add operator
   */
  public static readonly ADD: number = 0;

  /**
   * The Subtract operator
   */
  public static readonly SUBTRACT: number = 1;

  /**
   * The Negate operator
   */
  public static readonly NEGATE: number = 2;

  /**
   * The And operator
   */
  public static readonly AND: number = 3;

  /**
   * The Or operator
   */
  public static readonly OR: number = 4;

  /**
   * The Not operator
   */
  public static readonly NOT: number = 5;

  /**
   * The Equal operator
   */
  public static readonly EQUAL: number = 6;

  /**
   * The Greater-Than operator
   */
  public static readonly GREATER_THAN: number = 7;

  /**
   * The Less-Than operator
   */
  public static readonly LESS_THAN: number = 8;

  /**
   * The symbol of the Add operator
   */
  public static readonly ADD_SYMBOL: string = '+';

  /**
   * The symbol of the Subtract operator
   */
  public static readonly SUBTRACT_SYMBOL: string = '-';

  /**
   * The symbol of the Negate operator
   */
  public static readonly NEGATE_SYMBOL: string = '-';

  /**
   * The symbol of the And operator
   */
  public static readonly AND_SYMBOL: string = '&';

  /**
   * The symbol of the Or operator
   */
  public static readonly OR_SYMBOL: string = '|';

  /**
   * The symbol of the Not operator
   */
  public static readonly NOT_SYMBOL: string = '!';

  /**
   * The symbol of the Equal operator
   */
  public static readonly EQUAL_SYMBOL: string = '=';

  /**
   * The symbol of the Greater-Than operator
   */
  public static readonly GREATER_THAN_SYMBOL: string = '>';

  /**
   * The symbol of the Less-Than operator
   */
  public static readonly LESS_THAN_SYMBOL: string = '<';

  // The gui of the calculator
  private gui: CalculatorGUI;

  // The operators array
  private operators: string[] = [];

  // The inputs
  private input0: number = 0;
  private input1: number = 0;

  // The output
  private output: number = 0;

  /**
   * Constructs a new calculator with the given GUI.
   */
  public constructor(gui: CalculatorGUI) {
    super(gui !== null);
    this.gui = gui;

    this.operators = [];

    this.operators[Calculator.ADD] = Calculator.ADD_SYMBOL;
    this.operators[Calculator.SUBTRACT] = Calculator.SUBTRACT_SYMBOL;
    this.operators[Calculator.NEGATE] = Calculator.NEGATE_SYMBOL;
    this.operators[Calculator.AND] = Calculator.AND_SYMBOL;
    this.operators[Calculator.OR] = Calculator.OR_SYMBOL;
    this.operators[Calculator.NOT] = Calculator.NOT_SYMBOL;
    this.operators[Calculator.EQUAL] = Calculator.EQUAL_SYMBOL;
    this.operators[Calculator.GREATER_THAN] = Calculator.GREATER_THAN_SYMBOL;
    this.operators[Calculator.LESS_THAN] = Calculator.LESS_THAN_SYMBOL;
  }

  /**
   * Computes the value of the output according to the input and the given operator.
   * Assumes a legal operator.
   */
  public compute(operator: number): void {
    let result: number = 0;

    switch (operator) {
      case Calculator.ADD:
        result = this.input0 + this.input1;
        break;
      case Calculator.SUBTRACT:
        result = this.input0 - this.input1;
        break;
      case Calculator.NEGATE:
        result = -this.input1;
        break;
      case Calculator.AND:
        // tslint:disable-next-line: no-bitwise
        result = this.input0 & this.input1;
        break;
      case Calculator.OR:
        // tslint:disable-next-line: no-bitwise
        result = this.input0 | this.input1;
        break;
      case Calculator.NOT:
        // tslint:disable-next-line: no-bitwise
        result = ~this.input1;
        break;
      case Calculator.EQUAL:
        result = this.input0 === this.input1 ? -1 : 0;
        break;
      case Calculator.GREATER_THAN:
        result = this.input0 > this.input1 ? -1 : 0;
        break;
      case Calculator.LESS_THAN:
        result = this.input0 < this.input1 ? -1 : 0;
        break;
    }

    this.setValueAt(2, result, true);
  }

  public getGUI(): ComputerPartGUI {
    return this.gui;
  }

  public getValueAt(index: number): number {
    let result: number = 0;

    switch (index) {
      case 0:
        result = this.input0;
        break;
      case 1:
        result = this.input1;
        break;
      case 2:
        result = this.output;
        break;
    }

    return result;
  }

  public doSetValueAt(index: number, value: number): void {
    switch (index) {
      case 0:
        this.input0 = value;
        break;
      case 1:
        this.input1 = value;
        break;
      case 2:
        this.output = value;
        break;
    }
  }

  public reset(): void {
    super.reset();
    this.input0 = this.nullValue;
    this.input1 = this.nullValue;
    this.output = this.nullValue;
  }

  public refreshGUI(): void {
    this.quietUpdateGUI(0, this.input0);
    this.quietUpdateGUI(1, this.input1);
    this.quietUpdateGUI(2, this.output);
  }

  /**
   * Displays the calculator GUI with the given amount of inputs (1 or 2).
   */
  public showCalculator(operator: number, numOfInputs: number): void {
    if (this.animate) {
      if (numOfInputs === 2) {
        this.gui.showLeftInput();
      } else {
        this.gui.hideLeftInput();
      }
      this.gui.reset();
      this.gui.setOperator(this.operators[operator]);
      this.gui.showCalculator();
    }
  }

  /**
   * Hides the calculator GUI.
   */
  public hideCalculator(): void {
    if (this.animate) {
      this.gui.hideCalculator();
    }
  }
}

export default Calculator;
