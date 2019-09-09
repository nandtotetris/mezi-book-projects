class ProgramException extends Error {
  constructor(message: string, lineNumber?: number) {
    super('In line ' + lineNumber + ', ' + message);
  }
}

export default ProgramException;
