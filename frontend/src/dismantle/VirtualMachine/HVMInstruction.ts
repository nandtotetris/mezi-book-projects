import HVMInstructionSet from './HVMInstructionSet';
/**
 * This class represents a single hack Virtual machine instruction (with its arguments).
 * It holds the operation code that can be one of the VM operations
 * and up to 2 arguments.
 */
class HVMInstruction {
  // the operation code
  private opCode: number;

  // the operation arguments
  private arg0: number;
  private arg1: number;

  // A string argument
  private stringArg: string = '';

  // The number of arguments
  private numberOfArgs: number = 0;

  /**
   * Constructs a new instruction with two arguments.
   */
  public constructor(opCode: number, arg0?: number, arg1?: number) {
    this.opCode = opCode;
    const isArg0 = arg0 !== undefined;
    const isArg1 = arg1 !== undefined;
    if (isArg0 && isArg1) {
      this.numberOfArgs = 2;
    } else if (isArg0 || isArg1) {
      this.numberOfArgs = 1;
    } else {
      this.numberOfArgs = 0;
    }
    this.arg0 = arg0 !== undefined ? arg0 : -1;
    this.arg1 = arg1 !== undefined ? arg1 : -1;
  }

  /**
   * Returns the operation code
   */
  public getOpCode(): number {
    return this.opCode;
  }

  /**
   * Returns this.arg0
   */
  public getArg0(): number {
    return this.arg0;
  }

  /**
   * Returns this.arg1
   */
  public getArg1(): number {
    return this.arg1;
  }

  /**
   * Sets the string argument with the given string.
   */
  public setStringArg(arg: string): void {
    this.stringArg = arg;
  }

  /**
   * Returns the string argument
   */
  public getStringArg(): string {
    return this.stringArg;
  }

  /**
   * Returns the number of arguments.
   */
  public getNumberOfArgs(): number {
    return this.numberOfArgs;
  }

  /**
   * Returns an array of 3 Strings. The first is the operation name, the second is
   * the first argument and the third is the second argument.
   */
  public getFormattedStrings(): string[] {
    const result: string[] = [];
    const instructionSet: HVMInstructionSet = HVMInstructionSet.getInstance();
    result[1] = '';
    result[2] = '';

    result[0] = instructionSet.instructionCodeToString(this.opCode);
    if (result[0] === null) {
      result[0] = '';
    }

    switch (this.opCode) {
      case HVMInstructionSet.PUSH_CODE:
        result[1] = instructionSet.segmentCodeToVMString(this.arg0);
        result[2] = String(this.arg1);
        break;
      case HVMInstructionSet.POP_CODE:
        if (this.numberOfArgs === 2) {
          result[1] = instructionSet.segmentCodeToVMString(this.arg0);
          result[2] = String(this.arg1);
        }
        break;
      case HVMInstructionSet.LABEL_CODE:
        result[1] = this.stringArg;
        break;
      case HVMInstructionSet.GOTO_CODE:
        result[1] = this.stringArg;
        break;
      case HVMInstructionSet.IF_GOTO_CODE:
        result[1] = this.stringArg;
        break;
      case HVMInstructionSet.FUNCTION_CODE:
        result[1] = this.stringArg;
        result[2] = String(this.arg0);
        break;
      case HVMInstructionSet.CALL_CODE:
        result[1] = this.stringArg;
        result[2] = String(this.arg1);
        break;
    }

    return result;
  }

  public toString(): string {
    const formatted: string[] = this.getFormattedStrings();
    let result: string = '';
    if (formatted[0] !== '') {
      result = result.concat(formatted[0]);

      if (formatted[1] !== '') {
        result = result.concat(' ');
        result = result.concat(formatted[1]);

        if (formatted[2] !== '') {
          result = result.concat(' ');
          result = result.concat(formatted[2]);
        }
      }
    }

    return result.toString();
  }
}

export default HVMInstruction;
