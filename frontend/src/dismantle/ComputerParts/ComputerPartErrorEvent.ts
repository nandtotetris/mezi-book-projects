import ErrorEvent from '../Events/ErrorEvent';
import ComputerPart from './ComputerPart';
/**
 * An event for notifying a ComputerPartErrorEventListener on an error that occured
 * in a computer part.
 */
class ComputerPartErrorEvent extends ErrorEvent {
  /**
   * Constructs a new ComputerPartErrorEvent with the given source (computer part)
   * and errorMessage.
   */
  public constructor(source: ComputerPart, errorMessage: string) {
    super(source, errorMessage);
  }
}

export default ComputerPartErrorEvent;
