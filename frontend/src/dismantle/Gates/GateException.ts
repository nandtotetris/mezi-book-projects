/**
 * An exception for errors in a gate.
 */
export default class GateException extends Error {
  /**
   * Constructs a new GateException with the given message.
   */
  constructor(message: string) {
    super(message);
  }
}
