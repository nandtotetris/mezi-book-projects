import Vector from 'dismantle/Common/Vector';
import ErrorEvent from 'dismantle/Events/ErrorEvent';
import ErrorEventListener from 'dismantle/Events/ErrorEventListener';
import {
  BuiltInGate,
  Gate,
  GateErrorEvent,
  GateErrorEventListener,
  GateException,
} from 'dismantle/Gates/internal';
/**
 * A BuiltInGate with a GUI component.
 * Notifies its listeners on errors using the GateErrorEvent.
 * Also listens to ErrorEvents from the GUI (and therefore should register
 * as an ErrorEventListener to it). When such an event occures, the error is sent to
 * the error listeners of the computer part itself.
 */
export default abstract class BuiltInGateWithGUI extends BuiltInGate
  implements ErrorEventListener {
  // The gate parent of this gate. re-evaluates when a change is done through the gui.
  protected parent: Gate | null = null;
  private errorListeners: Vector;

  /**
   * Constructs a new BuiltInGateWithGUI.
   */
  constructor() {
    super();
    this.errorListeners = new Vector();
  }

  /**
   * Registers the given GateErrorEventListener as a listener to this simulator.
   */
  addErrorListener(listener: GateErrorEventListener) {
    this.errorListeners.addElement(listener);
  }

  /**
   * Un-registers the given GateErrorEventListener from being a listener to this GUI.
   */
  removeErrorListener(listener: GateErrorEventListener) {
    this.errorListeners.removeElement(listener);
  }

  /**
   * Notifies all the GateErrorEventListeners on an error that occured in the
   * computer part by creating a GateErrorEvent (with the error message) and sending
   * it using the gateErrorOccured method to all the listeners.
   */
  notifyErrorListeners(errorMessage: string) {
    const event = new GateErrorEvent(this as any, errorMessage);
    for (let i = 0; i < this.errorListeners.size(); i++) {
      (this.errorListeners.elementAt(
        i,
      ) as GateErrorEventListener).gateErrorOccured(event);
    }
  }

  /**
   * Clears all the GateErrorEventListeners from errors.
   */
  clearErrorListeners() {
    const event = new GateErrorEvent(this as any, '');

    for (let i = 0; i < this.errorListeners.size(); i++) {
      (this.errorListeners.elementAt(
        i,
      ) as GateErrorEventListener).gateErrorOccured(event);
    }
  }

  /**
   * Called when an error occured in the GUI.
   * The event contains the source object and the error message.
   */
  errorOccured(event: ErrorEvent) {
    this.notifyErrorListeners(event.getErrorMessage());
  }

  /**
   * Returns the GUI component of the chip.
   */
  abstract getGUIComponent(): any;

  /**
   * Returns the value of the chip at the given index.
   * Throws GateException if index is not legal.
   */
  abstract getValueAt(index: number): number;

  /**
   * Sets the value at the given index with the value.
   */
  abstract setValueAt(index: number, value: number): void;

  /**
   * Executes the given command, given in args[] style.
   * Subclasses may override this method to implement commands.
   */
  doCommand(command: string[]) {
    throw new GateException('This chip supports no commands');
  }

  /**
   * Sets the gate parent of this gate.
   * The given gate will be re-evaluated when the output of this gate changes.
   */
  setParent(gate: Gate) {
    this.parent = gate;
  }

  /**
   * Evaluates the parent of this gate.
   * Should be executed whenever a change is done to the gate through its gui (after
   * the gate's outputs were set).
   */
  protected evalParent() {
    if (this.parent !== null) {
      this.parent.setDirty();
      this.parent.eval();
    }
  }
}
