import ErrorEvent from './ErrorEvent';
/**
 * An interface for objects that wants to listen to the ErrorEvent.
 */
// tslint:disable-next-line: interface-name
interface ErrorEventListener {
  /**
   * Called when an error occured.
   * The event contains the source object and the error message.
   */
  errorOccured(event: ErrorEvent): void;
}

export default ErrorEventListener;
