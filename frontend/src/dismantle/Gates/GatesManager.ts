import Vector from 'dismantle/Common/Vector';
import {
  BuiltInGateWithGUI,
  Gate,
  GateErrorEventListener,
  GatesPanelGUI,
} from 'dismantle/Gates/internal';

/**
 * A singleton - manager for common gates properties.
 */
class GatesManager {
  /**
   * Returns the single instance of GatesManager.
   */
  static getInstance(): GatesManager {
    if (this.singleton === null) {
      this.singleton = new GatesManager();
    }
    return this.singleton;
  }

  // The single instance.
  private static singleton: GatesManager;

  // The working HDL dir
  private workingDir: string = '';

  // The BuiltIn HDL dir
  private builtInDir: string = '';

  // The gates panel on which gate components are added
  private gatesPanel: GatesPanelGUI | null = null;

  // The error handler for errors that occur in the gate components.
  private errorHandler: GateErrorEventListener | null = null;

  // The list of built in chips with gui
  private chips: Vector;

  // When true, BuiltIn chips with gui should create and update their gui.
  // otherwise, their gui shouldn't be created.
  private updateChipsGUI: boolean;

  /**
   * Constructs a new GatesManager.
   */
  private constructor() {
    this.chips = new Vector();
    this.updateChipsGUI = true;
  }

  /**
   * Returns the current HDL dir.
   */
  getWorkingDir(): string {
    return this.workingDir;
  }

  /**
   * Sets the current HDL dir with the given dir.
   */
  setWorkingDir(file: string) {
    this.workingDir = file;
  }

  /**
   * Returnss the BuiltIn HDL dir.
   */
  getBuiltInDir(): string {
    return this.builtInDir;
  }

  /**
   * Sets the BuiltIn HDL dir with the given dir.
   */
  setBuiltInDir(file: string) {
    this.builtInDir = file;
  }

  /**
   * Returns all the chips in the gate manager.
   */
  getChips(): BuiltInGateWithGUI[] {
    const array: BuiltInGateWithGUI[] = [];
    this.chips.toArray(array);
    return array;
  }

  /**
   * Adds the given chip with gui to the chips' list and to the gates panel.
   */
  addChip(chip: BuiltInGateWithGUI) {
    this.chips.add(chip);
    if (this.errorHandler !== null) {
      chip.addErrorListener(this.errorHandler);
    }
    chip.setParent(chip as any); // set the chip to be its own parent for Eval notifications.

    if (this.gatesPanel !== null) {
      this.gatesPanel.addGateComponent(chip.getGUIComponent());
    }
  }

  /**
   * Removes the given chip with gui from the chips' list and from the gates panel.
   */
  removeChip(chip: BuiltInGateWithGUI) {
    this.chips.remove(chip);
    if (this.errorHandler !== null) {
      chip.removeErrorListener(this.errorHandler);
    }
    if (this.gatesPanel !== null) {
      this.gatesPanel.removeGateComponent(chip.getGUIComponent());
    }
  }

  /**
   * Remove all the chips from the list and from the gates panel.
   */
  removeAllChips() {
    if (this.errorHandler !== null) {
      for (let i = 0; i < this.chips.size(); i++) {
        (this.chips.elementAt(i) as BuiltInGateWithGUI).removeErrorListener(
          this.errorHandler,
        );
      }
    }

    this.chips.removeAllElements();
    if (this.gatesPanel !== null) {
      this.gatesPanel.removeAllGateComponents();
    }
  }

  /**
   * Sets the gates panel with the given gate panel.
   */
  setGatesPanel(gatesPanel: GatesPanelGUI) {
    this.gatesPanel = gatesPanel;
  }

  /**
   * Returns the error handler.
   */
  getErrorHandler(): GateErrorEventListener | null {
    return this.errorHandler;
  }

  /**
   * Sets the error handler.
   */
  setErrorHandler(errorHandler: GateErrorEventListener) {
    this.errorHandler = errorHandler;
  }

  /**
   * Returns the full HDL file name that matches the given gate name.
   * The HDL file is searched first in the current dir, and if not found, in the BuiltIn dir.
   * If not found in any of them, returns null.
   */
  getHDLFileName(gateName: string): string | null {
    if (localStorage.getItem(`${gateName}HDL`) === null) {
      return null;
    }
    return gateName;
  }

  /**
   * Returns true if built in chips with gui should create and update their gui components.
   */
  isChipsGUIEnabled(): boolean {
    return this.updateChipsGUI;
  }

  /**
   * Sets whether built in chips with gui should create and update their gui components
   * or not.
   */
  enableChipsGUI(value: boolean) {
    this.updateChipsGUI = value;
  }
}
