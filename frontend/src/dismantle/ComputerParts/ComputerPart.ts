import ComputerPartGUI from './ComputerPartGUI';
/**
 * Represents a part of a computer.
 */
abstract class ComputerPart {
  // If true, changes to the computer part's values will be displayed in its gui.
  protected displayChanges: boolean = true;

  // If true, changes to the computer part's values will be animated.
  protected animate: boolean;

  // when true, the ComputerPart should display its contents.
  protected hasGUI: boolean;

  /**
   * Constructs a new ComputerPart.
   * If hasGUI is true, the ComputerPart will display its contents.
   */
  public constructor(hasGUI: boolean) {
    this.hasGUI = hasGUI;
    this.displayChanges = hasGUI;
    this.animate = false;
  }

  /**
   * Sets the display changes property of the computer part. If set to true, changes
   * that are made to the values of the computer part will be displayed in its GUI.
   * Otherwise, changes will not be displayed.
   */
  public setDisplayChanges(trueOrFalse: boolean): void {
    this.displayChanges = trueOrFalse && this.hasGUI;
  }

  /**
   * Sets the animate property of the computer part. If set to true, changes
   * that are made to the values of the computer part will be animated.
   */
  public setAnimate(trueOrFalse: boolean): void {
    this.animate = trueOrFalse && this.hasGUI;
  }

  /**
   * Resets the contents of the computer part.
   */
  public reset(): void {
    if (this.hasGUI) {
      this.getGUI().reset();
    }
  }

  /**
   * Returns the GUI of the computer part.
   */
  public abstract getGUI(): ComputerPartGUI;

  /**
   * Refreshes the GUI of this computer part.
   */
  public abstract refreshGUI(): void;
}

export default ComputerPart;
