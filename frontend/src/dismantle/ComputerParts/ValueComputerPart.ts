import ComputerPart from './ComputerPart';
import ValueComputerPartGUI from './ValueComputerPartGUI';
/**
 * A value computer part - a computer part that has values which can be get & set.
 */
abstract class ValueComputerPart extends ComputerPart {
  // The amount of miliseconds that a changed value will flash.
  private static readonly FLASH_TIME: number = 500;

  // used as default value (in reset)
  protected nullValue: number = 0;

  /**
   * Constructs a new ValueComputerPart
   * If hasGUI is true, the ComputerPart should display its contents.
   */
  public constructor(hasGUI: boolean) {
    super(hasGUI);
  }

  /**
   * Sets the element at the given index with the given value and updates the gui.
   */
  public setValueAt(index: number, value: number, quiet: boolean): void {
    this.doSetValueAt(index, value);
    if (this.displayChanges) {
      if (quiet) {
        this.quietUpdateGUI(index, value);
      } else {
        this.updateGUI(index, value);
      }
    }
  }

  /**
   * Sets the element at the given index with the given value.
   */
  public abstract doSetValueAt(index: number, value: number): void;

  /**
   * Returns the element at the given index.
   */
  public abstract getValueAt(index: number): number;

  /**
   * Updates the GUI of this computer part at the given location with the given value
   */
  public updateGUI(index: number, value: number): void {
    if (this.displayChanges) {
      const gui: ValueComputerPartGUI = this.getGUI() as ValueComputerPartGUI;
      gui.setValueAt(index, value);

      if (this.animate) {
        gui.flash(index);
        setTimeout(gui.hideFlash, ValueComputerPart.FLASH_TIME);
      }

      gui.highlight(index);
    }
  }

  /**
   * Updates the GUI of this computer part at the given location with the given value
   * quietly - no flashing will be done
   */
  public quietUpdateGUI(index: number, value: number): void {
    if (this.displayChanges) {
      (this.getGUI() as ValueComputerPartGUI).setValueAt(index, value);
    }
  }

  /**
   * Hides all highlightes.
   */
  public hideHighlight(): void {
    if (this.displayChanges) {
      (this.getGUI() as ValueComputerPartGUI).hideHighlight();
    }
  }

  /**
   * Sets the numeric format with the given code (out of the format constants in HackController).
   */
  public setNumericFormat(formatCode: number): void {
    if (this.displayChanges) {
      (this.getGUI() as ValueComputerPartGUI).setNumericFormat(formatCode);
    }
  }

  /**
   * Sets the null value (default value) of this computer part with the given value.
   * If hideNullValue is true, values which are equal to the null value will be
   * hidden.
   */
  public setNullValue(value: number, hideNullValue: boolean): void {
    this.nullValue = value;

    if (this.hasGUI) {
      const gui: ValueComputerPartGUI = this.getGUI() as ValueComputerPartGUI;
      gui.setNullValue(value, hideNullValue);
    }
  }
}

export default ValueComputerPart;
