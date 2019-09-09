import ActionEvent from './ActionEvent';
import HackTranslatorEvent from './HackTranslatorEvent';
import TextFileEvent from './TextFileEvent';
/**
 * An interface for objects that want to listen to HackTranslatorEvents.
 */
// tslint:disable-next-line: interface-name
export interface HackTranslatorEventListener {
  /**
   * Called when an action was performed in the HackTranslatorGUI.
   * The given event contains the source object, the performed action's code
   * and the action's supplied data object.
   */
  translatorActionPerformed(event: HackTranslatorEvent): void;
}

// tslint:disable-next-line: interface-name
export interface ActionListener {
  actionPerformed(var1: ActionEvent | null): void;
}

/**
 * An interface for objects that wants to listen to the TextFileEvent.
 */
// tslint:disable-next-line: interface-name
export interface TextFileEventListener {
  /**
   * Called when a new row is selected in a Text File.
   * The event contains the source object and the selected row String.
   */
  rowSelected(event: TextFileEvent): void;
}

/**
 * An interface for the GUI of a Computer Part.
 */
// tslint:disable-next-line: interface-name
export interface ComputerPartGUI {
  /**
   * Resets the contents of the computer part GUI.
   */
  reset(): void;
}

/**
 * An interface for the GUI of a text file.
 */
// tslint:disable-next-line: interface-name
export interface TextFileGUI extends ComputerPartGUI {
  /**
   * Registers the given TextFileEventListener as a listener to this GUI.
   */
  addTextFileListener(listener: TextFileEventListener): void;

  /**
   * Un-registers the given TextFileEventListener from being a listener to this GUI.
   */
  removeTextFileListener(listener: TextFileEventListener): void;

  /**
   * Notifies all the TextFileEventListeners on a change in the selected row by creating
   * an TextFileEvent (with the selected row string and index) and sending it using the
   * rowSelected method to all the listeners.
   */
  notifyTextFileListeners(rowSrting: string, rowIndex: number): void;

  /**
   * Sets the TextFile's contents with the given file.
   */
  setContents(fileName: string): void;

  /**
   * Sets the contents of the text file with the given String array.
   */
  // tslint:disable-next-line: unified-signatures
  setContents(text: string[]): void;

  /**
   * Adds the given line at the end of the text file.
   */
  addLine(line: string): void;

  /**
   * Highlights the line with the given index. This adds to the current highlighted lines.
   * If clear is true, other highlights will be cleared.
   */
  addHighlight(index: number, clear: boolean): void;

  /**
   * Clears all the current highlights.
   */
  clearHighlights(): void;

  /**
   * Puts an emphasis on the line with the given index. This adds to the current
   * emphasized lines.
   */
  addEmphasis(index: number): void;

  /**
   * Removes the emphasis from the line with the given index. This removes the line
   * from the current emphasized lines.
   */
  removeEmphasis(index: number): void;

  /**
   * Returns the line at the given index (assumes a legal index).
   */
  getLineAt(index: number): string;

  /**
   * Replaces the line at the given index (assumes a legal index) with the given line.
   */
  setLineAt(index: number, line: string): void;

  /**
   * Returns the number of lines in the file.
   */
  getNumberOfLines(): number;

  /**
   * Selects the commands in the range fromIndex..toIndex
   */
  select(fromIndex: number, toIndex: number): void;

  /**
   * Hides all selections.
   */
  hideSelect(): void;
}

/**
 * The GUI of the HackTranslator.
 */
// tslint:disable-next-line: interface-name
export interface HackTranslatorGUI {
  /**
   * Registers the given HackTranslatorEventListener as a listener to this GUI.
   */
  addHackTranslatorListener(listener: HackTranslatorEventListener): void;

  /**
   * Un-registers the given HackTranslatorEventListener from being a listener to this GUI.
   */
  removeHackTranslatorListener(listener: HackTranslatorEventListener): void;

  /**
   * Notify all the HackTranslatorEventListeners on actions taken in it, by creating
   * a HackTranslatorEvent (with the action and supplied data) and sending it using
   * the actionPerformed method to all the listeners.
   */
  notifyHackTranslatorListeners(action: number, data: object): void;

  /**
   * Displays the given message, according to the given type.
   */
  displayMessage(message: string, error: boolean): void;

  /**
   * Sets the title of the translator with the given title.
   */
  setTitle(title: string): void;

  /**
   * Returns the GUI of the Source file.
   */
  getSource(): TextFileGUI;

  /**
   * Returns the GUI of the Destination file.
   */
  getDestination(): TextFileGUI;

  /**
   * Sets the name of the Source file with the given name.
   */
  setSourceName(name: string): void;

  /**
   * Sets the name of the Destination file with the given name.
   */
  setDestinationName(name: string): void;

  /**
   * Sets the working dir name with the given one.
   * This can be used instead to set the key in the local storage
   */
  setWorkingDir(file: string): void;

  /**
   * Sets the name of the html file that contains the help usage.
   */
  setUsageFileName(fileName: string): void;

  /**
   * Sets the name of the html file that contains the "about" information.
   */
  setAboutFileName(fileName: string): void;

  /**
   * Enables the single step action.
   */
  enableSingleStep(): void;

  /**
   * Disables the single step action.
   */
  disableSingleStep(): void;

  /**
   * Enables the fast forward action.
   */
  enableFastForward(): void;

  /**
   * Disables the fast forward action.
   */
  disableFastForward(): void;

  /**
   * Enables the stop action.
   */
  enableStop(): void;

  /**
   * Disables the stop action.
   */
  disableStop(): void;

  /**
   * Enables the rewind action.
   */
  enableRewind(): void;

  /**
   * Disables the rewind action.
   */
  disableRewind(): void;

  /**
   * Enables the full compilation action.
   */
  enableFullCompilation(): void;

  /**
   * Disables the full compilation action.
   */
  disableFullCompilation(): void;

  /**
   * Enables the save action.
   */
  enableSave(): void;

  /**
   * Disables the save action.
   */
  disableSave(): void;

  /**
   * Enables loading a new source file.
   */
  enableLoadSource(): void;

  /**
   * Disables loading a new source file.
   */
  disableLoadSource(): void;

  /**
   * Enables selecting a row in the source.
   */
  enableSourceRowSelection(): void;

  /**
   * Disables selecting a row in the source.
   */
  disableSourceRowSelection(): void;
}

/**
 * The GUI of the HackAssembler.
 */
// tslint:disable-next-line: interface-name
export interface HackAssemblerGUI extends HackTranslatorGUI {
  /**
   * Returns the GUI of the Comparison file.
   */
  getComparison(): TextFileGUI;

  /**
   * Sets the name of the Comparison file with the given name.
   */
  setComparisonName(name: string): void;

  /**
   * Enables loading a comparison file.
   */
  enableLoadComparison(): void;

  /**
   * Disables loading a comparison file.
   */
  disableLoadComparison(): void;

  /**
   * Shows the comparison file
   */
  showComparison(): void;

  /**
   * Hides the comparison file
   */
  hideComparison(): void;
}

// tslint:disable-next-line: interface-name
export interface Runnable {
  run(): void;
}

export class HackTranslatorException extends Error {}

// tslint:disable-next-line: max-classes-per-file
export class AssemblerException extends Error {}
