import EventObject from './EventObject';
/**
 * An event for notifying on an error.
 */
class ErrorEvent extends EventObject {
  // the error message
  private errorMessage: string;

  /**
   * Constructs a new ErrorEvent with the given source and error message.
   */
  public constructor(source: object, errorMessage: string) {
    super(source);
    this.errorMessage = errorMessage;
  }

  /**
   * Returns the error message.
   * If null, the error display should be cleared.
   */
  public getErrorMessage(): string {
    return this.errorMessage;
  }
}

export default ErrorEvent;
