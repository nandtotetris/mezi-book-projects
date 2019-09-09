import Vector from '../Common/Vector';
import ErrorEvent from '../Events/ErrorEvent';
import ErrorEventListener from '../Events/ErrorEventListener';
import ComputerPart from './ComputerPart';
import ComputerPartErrorEvent from './ComputerPartErrorEvent';
import ComputerPartErrorEventListener from './ComputerPartErrorEventListener';
/**
 * An interactive computer part - a computer part that enables input to its GUI.
 * This is the abstract base class for all interactive computer parts.
 * This computer part notifies its listeners on errors using the ComputerPartErrorEvent.
 * It also listens to ComputerPartGUIErrorEvents from the GUI (and therefore should register
 * as a ComputerPartGUIErrorEventlistener to it). When such an event occures,
 * the error is sent to the error listeners of the computer part itself.
 */
abstract class InteractiveComputerPart extends ComputerPart
  implements ErrorEventListener {
  private errorListeners: Vector;

  /**
   * Constructs a new interactive computer part.
   * If hasGUI is true, the ComputerPart will display its contents.
   */
  public constructor(hasGUI: boolean) {
    super(hasGUI);
    this.errorListeners = new Vector();
  }

  /**
   * Registers the given ComputerPartErrorEventListener as a listener to this ComputerPart.
   */
  public addErrorListener(listener: ComputerPartErrorEventListener): void {
    this.errorListeners.addElement(listener);
  }

  /**
   * Un-registers the given ComputerPartErrorEventListener from being a listener
   * to this ComputerPart.
   */
  public removeErrorListener(listener: ComputerPartErrorEventListener): void {
    this.errorListeners.remove(listener);
  }

  /**
   * Notifies all the ComputerPartErrorEventListeners on an error that occured in the
   * computer part by creating a ComputerPartErrorEvent (with the error message)
   * and sending it using the computerPartErrorOccured method to all the listeners.
   */
  public notifyErrorListeners(errorMessage: string): void {
    const event: ComputerPartErrorEvent = new ComputerPartErrorEvent(
      this,
      errorMessage,
    );

    for (let i = 0; i < this.errorListeners.size(); i++) {
      (this.errorListeners.elementAt(
        i,
      ) as ComputerPartErrorEventListener).computerPartErrorOccured(event);
    }
  }

  /**
   * Clears all the ComputerPartErrorEventListeners from errors.
   */
  public clearErrorListeners(): void {
    const event: ComputerPartErrorEvent = new ComputerPartErrorEvent(this, '');

    for (let i = 0; i < this.errorListeners.size(); i++) {
      (this.errorListeners.elementAt(
        i,
      ) as ComputerPartErrorEventListener).computerPartErrorOccured(event);
    }
  }

  /**
   * Called when an error occured in the GUI.
   * The event contains the source object and the error message.
   */
  public errorOccured(event: ErrorEvent): void {
    this.notifyErrorListeners(event.getErrorMessage());
  }
}

export default InteractiveComputerPart;
