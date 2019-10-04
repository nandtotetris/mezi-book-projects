import HVMInstructionSet from 'dismantle/VirtualMachine/HVMInstructionSet';

/**
 * Emits VM commands into a file, using the VM
 * command syntax.
 */
class VMWriter {
  private output: string[] = [];
  private instructionSet: HVMInstructionSet = HVMInstructionSet.getInstance();
  /**
   * Creates a new file and prepares it for writing.
   * Output is for now returned as a string, and is not
   * written to a file.
   * @param output name of the output file
   */
  constructor(output: string = 'vm_output') {}

  /**
   * Writes a VM push command
   * @param segment segment code
   * @param index segment index
   */
  public writePush(segment: number, index: number) {
    this.output.push(
      `push ${this.instructionSet.segmentCodeToVMString(segment)} ${index}`,
    );
  }

  /**
   * Writes a VM pop command
   * @param segment segment code
   * @param index segment index
   */
  public writePop(segment: number, index: number) {
    this.output.push(
      `pop ${this.instructionSet.segmentCodeToVMString(segment)} ${index}`,
    );
  }

  /**
   * Writes a VM arithmetic command
   * @param operator operator code
   */
  public writeArithmetic(operator: number) {
    switch (operator) {
      case HVMInstructionSet.ADD_CODE:
        this.output.push(HVMInstructionSet.ADD_STRING);
        break;
      case HVMInstructionSet.SUBSTRACT_CODE:
        this.output.push(HVMInstructionSet.SUBSTRACT_STRING);
        break;
      case HVMInstructionSet.NOT_CODE:
        this.output.push(HVMInstructionSet.NOT_STRING);
        break;
      case HVMInstructionSet.NEGATE_CODE:
        this.output.push(HVMInstructionSet.NEGATE_STRING);
        break;
      case HVMInstructionSet.EQUAL_CODE:
        this.output.push(HVMInstructionSet.EQUAL_STRING);
        break;
      case HVMInstructionSet.GREATER_THAN_CODE:
        this.output.push(HVMInstructionSet.GREATER_THAN_STRING);
        break;
      case HVMInstructionSet.LESS_THAN_CODE:
        this.output.push(HVMInstructionSet.LESS_THAN_STRING);
        break;
      case HVMInstructionSet.AND_CODE:
        this.output.push(HVMInstructionSet.AND_STRING);
        break;
      case HVMInstructionSet.OR_CODE:
        this.output.push(HVMInstructionSet.OR_STRING);
        break;

      default:
        break;
    }
  }

  /**
   * Writes a VM label command
   * @param label label string
   */
  public writeLabel(label: string) {
    this.output.push(`${HVMInstructionSet.LABEL_STRING} ${label}`);
  }

  /**
   * Writes a VM goto command
   * @param label label string
   */
  public writeGoto(label: string) {
    this.output.push(`${HVMInstructionSet.GOTO_STRING} ${label}`);
  }

  /**
   * Writes a VM if-goto command
   * @param label label string
   */
  public writeIf(label: string) {
    this.output.push(`${HVMInstructionSet.IF_GOTO_STRING} ${label}`);
  }

  /**
   * Writes a VM call command
   * @param name name of the function
   * @param nArgs number of arguments
   */
  public writeCall(name: string, nArgs: number) {
    this.output.push(`call ${name} ${nArgs}`);
  }

  /**
   * Writes a VM function command
   * @param name name of the function
   * @param nLocals number of local variables
   */
  public writeFunction(name: string, nLocals: number) {
    this.output.push(`function ${name} ${nLocals}`);
  }

  /**
   * Writes a VM return command
   */
  public writeReturn() {
    this.output.push('return');
  }
  /**
   * Cloes the output file
   */
  public close() {}

  /**
   * Not part of the official api, but useful to get
   * the string representation of the output
   */
  public getOutput(): string {
    return this.output.join('\n');
  }
}

export default VMWriter;
