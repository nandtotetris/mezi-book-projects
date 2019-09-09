import ErrorEventListener from '../Events/ErrorEventListener';
import ComputerPartGUI from './ComputerPartGUI';
/**
 * An interface for the GUI of an interactive computer part.
 * This GUI enables user input and therefore should handle errors
 * using the ErrorEvent.
 */
interface InteractiveComputerPartGUI extends ComputerPartGUI {
  /**
   * Registers the given ErrorEventListener as a listener to this simulator.
   */
  addErrorListener(listener: ErrorEventListener): void;

  /**
   * Un-registers the given ErrorEventListener from being a listener
   * to this GUI.
   */
  removeErrorListener(listener: ErrorEventListener): void;

  /**
   * Notifies all the ErrorEventListeners on an error that occured in the
   * computer part gui by creating an ErrorEvent (with the error message)
   * and sending it using the errorOccured method to all the listeners.
   */
  notifyErrorListeners(errorMessage: string): void;
}

export default InteractiveComputerPartGUI;
