import ValueComputerPartGUI from '../ComputerParts/ValueComputerPartGUI';

/**
 * An interface for the GUI of the Calculator.
 */
// tslint:disable-next-line: interface-name
interface CalculatorGUI extends ValueComputerPartGUI {
  /**
   * Sets the operator of the calculator with the given operator.
   */
  setOperator(operator: string): void;

  /**
   * Displays the calculator GUI.
   */
  showCalculator(): void;

  /**
   * Hides the calculator GUI.
   */
  hideCalculator(): void;

  /**
   * Displays the left input.
   */
  showLeftInput(): void;

  /**
   * Hides the left input.
   */
  hideLeftInput(): void;
}

export default CalculatorGUI;
