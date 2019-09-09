import HVMInstruction from '../VirtualMachine/HVMInstruction';
/**
 * An HVMInstruction for the use of the VMEmulator.
 */
class VMEmulatorInstruction extends HVMInstruction {
  // The index of the instruction in its containing function.
  private indexInFunction: number = 0;

  /**
   * Constructs a new instruction with two arguments and the index in function.
   */
  public constructor(
    opCode: number,
    indexInFunction: number,
    arg0?: number,
    arg1?: number,
  ) {
    super(opCode, arg0, arg1);
    this.indexInFunction = indexInFunction;
  }

  /**
   * Returns the index of this instruction in its containing function.
   * A negative value represents no index.
   */
  public getIndexInFunction(): number {
    return this.indexInFunction;
  }
}

export default VMEmulatorInstruction;
