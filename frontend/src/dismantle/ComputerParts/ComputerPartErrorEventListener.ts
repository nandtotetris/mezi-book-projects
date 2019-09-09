import ComputerPartErrorEvent from './ComputerPartErrorEvent';
/**
 * An interface for objects that want to listen to the ComputerPartErrorEvent.
 */
// tslint:disable-next-line: interface-name
interface ComputerPartErrorEventListener {
  /**
   * Called when an error occured in the ComputerPart.
   * The event contains the source object and the error message.
   */
  computerPartErrorOccured(event: ComputerPartErrorEvent): void;
}

export default ComputerPartErrorEventListener;
