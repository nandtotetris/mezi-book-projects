/**
 * An exception for errors in the HDL file.
 */
export default class HDLException extends Error {
  /**
   * Constructs a new HDLException with the given message, HDL file name and Line number.
   */
  constructor(message: string, HDLName?: string, lineNumber?: number) {
    let msg = '';
    if (HDLName !== undefined) {
      msg = `In HDL file ${HDLName}`;
    }
    if (lineNumber !== undefined) {
      msg = `${msg} , Line ${lineNumber}`;
    }
    msg = `${msg} , ${message}`;
    super(msg);
  }
}
