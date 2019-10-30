import ErrorEvent from 'dismantle/Events/ErrorEvent';
import { Gate } from 'dismantle/Gates/internal';
/**
 * An event for notifying a GateErrorEventListener on an error that occured
 * in a gate.
 */
class GateErrorEvent extends ErrorEvent {
  /**
   * Constructs a new GateErrorEvent with the given source (gate)
   * and errorMessage.
   */
  constructor(source: Gate, errorMessage: string) {
    super(source, errorMessage);
  }
}

export default GateErrorEvent;
