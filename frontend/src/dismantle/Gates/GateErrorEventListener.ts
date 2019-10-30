import { GateErrorEvent } from 'dismantle/Gates/internal';
/**
 * An interface for objects that wants to listen to the GateErrorEvent.
 */
// tslint:disable-next-line: interface-name
export default interface GateErrorEventListener {
  /**
   * Called when an error occured in a gate.
   * The event contains the source object and the error message.
   */
  gateErrorOccured(event: GateErrorEvent): void;
}
