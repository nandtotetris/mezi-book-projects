import ComputerPartGUI from './ComputerPartGUI';
import Point from './Point';
/**
 * An interface for the GUI of a computer part that holds values.
 */
// tslint:disable-next-line: interface-name
interface ValueComputerPartGUI extends ComputerPartGUI {
  /**
   * Returns the coordinates of the top left corner of the value at the given index.
   */
  getCoordinates(index: number): Point;

  /**
   * Sets the element at the given index with the given value.
   */
  setValueAt(index: number, value: number): void;

  /**
   * Returns the value at the given index in its string representation.
   */
  getValueAsString(index: number): string;

  /**
   * Highlights the value at the given index.
   */
  highlight(index: number): void;

  /**
   * Hides all highlightes.
   */
  hideHighlight(): void;

  /**
   * flashes the value at the given index.
   */
  flash(index: number): void;

  /**
   * hides the existing flash.
   */
  hideFlash(): void;

  /**
   * Sets the numeric format with the given code (out of the format constants in HackController).
   */
  setNumericFormat(formatCode: number): void;

  /**
   * Sets the null value (default value) of this computer part with the given value.
   * If hideNullValue is true, values which are equal to the null value will be
   * hidden.
   */
  setNullValue(value: number, hideNullValue: boolean): void;
}

export default ValueComputerPartGUI;
