import Hashtable from '../Common/Hashtable';
import Definitions from '../Utilities/Definitions';
/**
 * The instruction set of the hack virtual machine.
 * This is a singleton class.
 */
class HVMInstructionSet {
  /**
   * Add instruction code
   */
  public static readonly ADD_CODE: number = 1;

  /**
   * Substract instruction code
   */
  public static readonly SUBSTRACT_CODE: number = 2;

  /**
   * Negate instruction code
   */
  public static readonly NEGATE_CODE: number = 3;

  /**
   * Equal instruction code
   */
  public static readonly EQUAL_CODE: number = 4;

  /**
   * Greater-Than instruction code
   */
  public static readonly GREATER_THAN_CODE: number = 5;

  /**
   * Less-Than instruction code
   */
  public static readonly LESS_THAN_CODE: number = 6;

  /**
   * And instruction code
   */
  public static readonly AND_CODE: number = 7;

  /**
   * Or instruction code
   */
  public static readonly OR_CODE: number = 8;

  /**
   * Not instruction code
   */
  public static readonly NOT_CODE: number = 9;

  /**
   * Push instruction code
   */
  public static readonly PUSH_CODE: number = 10;

  /**
   * Pop instruction code
   */
  public static readonly POP_CODE: number = 11;

  /**
   * Label instruction code
   */
  public static readonly LABEL_CODE: number = 12;

  /**
   * Goto instruction code
   */
  public static readonly GOTO_CODE: number = 13;

  /**
   * If-Goto instruction code
   */
  public static readonly IF_GOTO_CODE: number = 14;

  /**
   * Function instruction code
   */
  public static readonly FUNCTION_CODE: number = 15;

  /**
   * Return instruction code
   */
  public static readonly RETURN_CODE: number = 16;

  /**
   * Call instruction code
   */
  public static readonly CALL_CODE: number = 17;

  /**
   * Unknown instruction code
   */
  public static readonly UNKNOWN_INSTRUCTION: number = -99;

  /**
   * Add instruction string
   */
  public static readonly ADD_STRING: string = 'add';

  /**
   * Substract instruction string
   */
  public static readonly SUBSTRACT_STRING: string = 'sub';

  /**
   * Negate instruction string
   */
  public static readonly NEGATE_STRING: string = 'neg';

  /**
   * Equal instruction string
   */
  public static readonly EQUAL_STRING: string = 'eq';

  /**
   * Greater-Than instruction string
   */
  public static readonly GREATER_THAN_STRING: string = 'gt';

  /**
   * Less-Than instruction string
   */
  public static readonly LESS_THAN_STRING: string = 'lt';

  /**
   * And instruction string
   */
  public static readonly AND_STRING: string = 'and';

  /**
   * Or instruction string
   */
  public static readonly OR_STRING: string = 'or';

  /**
   * Not instruction string
   */
  public static readonly NOT_STRING: string = 'not';

  /**
   * Push instruction string
   */
  public static readonly PUSH_STRING: string = 'push';

  /**
   * Pop instruction string
   */
  public static readonly POP_STRING: string = 'pop';

  /**
   * Label instruction string
   */
  public static readonly LABEL_STRING: string = 'label';

  /**
   * Goto instruction string
   */
  public static readonly GOTO_STRING: string = 'goto';

  /**
   * If-Goto instruction string
   */
  public static readonly IF_GOTO_STRING: string = 'if-goto';

  /**
   * Function instruction string
   */
  public static readonly FUNCTION_STRING: string = 'function';

  /**
   * Return instruction string
   */
  public static readonly RETURN_STRING: string = 'return';

  /**
   * Call instruction string
   */
  public static readonly CALL_STRING: string = 'call';

  // Memory segments

  /**
   * The number of actual memory segments
   */
  public static readonly NUMBER_OF_ACTUAL_SEGMENTS: number = 5;

  // The actual segments should be numbered from 0 onwards, so they can be used as array indice.

  /**
   * Local segment code
   */
  public static readonly LOCAL_SEGMENT_CODE: number = 0;

  /**
   * Arg segment code
   */
  public static readonly ARG_SEGMENT_CODE: number = 1;

  /**
   * This segment code
   */
  public static readonly THIS_SEGMENT_CODE: number = 2;

  /**
   * That segment code
   */
  public static readonly THAT_SEGMENT_CODE: number = 3;

  /**
   * Temp segment code
   */
  public static readonly TEMP_SEGMENT_CODE: number = 4;

  /**
   * Static virtual segment code
   */
  public static readonly STATIC_SEGMENT_CODE: number = 100;

  /**
   * Const virtual segment code
   */
  public static readonly CONST_SEGMENT_CODE: number = 101;

  /**
   * Pointer virtual segment code
   */
  public static readonly POINTER_SEGMENT_CODE: number = 102;

  /**
   * Unknown segment code
   */
  public static readonly UNKNOWN_SEGMENT: number = -1;

  /**
   * Static virtual segment string in VM
   */
  public static readonly STATIC_SEGMENT_VM_STRING: string = 'static';

  /**
   * Local segment string in VM
   */
  public static readonly LOCAL_SEGMENT_VM_STRING: string = 'local';

  /**
   * Arg segment string in VM
   */
  public static readonly ARG_SEGMENT_VM_STRING: string = 'argument';

  /**
   * This segment string in VM
   */
  public static readonly THIS_SEGMENT_VM_STRING: string = 'this';

  /**
   * That segment string in VM
   */
  public static readonly THAT_SEGMENT_VM_STRING: string = 'that';

  /**
   * Temp segment string in VM
   */
  public static readonly TEMP_SEGMENT_VM_STRING: string = 'temp';

  /**
   * Const virtual segment string in VM
   */
  public static readonly CONST_SEGMENT_VM_STRING: string = 'constant';

  /**
   * Pointer virtual segment string in VM
   */
  public static readonly POINTER_SEGMENT_VM_STRING: string = 'pointer';

  /**
   * Returns the single instance of the instruction set.
   */
  public static getInstance(): HVMInstructionSet {
    if (HVMInstructionSet.instance === null) {
      return new HVMInstructionSet();
    }
    return HVMInstructionSet.instance;
  }

  // the single instance
  private static instance: HVMInstructionSet | null = null;

  // the translation table from instruction strings to codes.
  private instructionToCode: Hashtable = new Hashtable();

  // the translation table from instruction codes to strings.
  private instructionToString: Hashtable = new Hashtable();

  // the translation table from segment VM strings to codes.
  private segmentCodes: Hashtable = new Hashtable();

  // the translation table from segment codes to segment VM strings.
  private segmentStrings: Hashtable = new Hashtable();

  // the translation table from segment VM strings to hardware pointer names.
  private segmentPointerStrings: Hashtable = new Hashtable();

  // Constructs the singlton HVMInstructionSet
  private constructor() {
    HVMInstructionSet.instance = this;
    this.initInstructions();
    this.initSegmentStrings();
    this.initSegmentCodes();
  }

  /**
   * Returns the code of the  given instruction string.
   * If not exists, returns UNKNOWN_INSTRUCTION.
   */
  public instructionStringToCode(instruction: string): number {
    const result: number = this.instructionToCode.get(instruction);
    return result !== undefined
      ? result
      : HVMInstructionSet.UNKNOWN_INSTRUCTION;
  }

  /**
   * Returns the string of the given instruction code.
   * If not exists, returns null.
   */
  public instructionCodeToString(code: number): string {
    return this.instructionToString.get(code);
  }

  /**
   * Returns true if the given segment VM string is a legal segment string.
   */
  public isLegalVMSegment(segment: string): boolean {
    return this.segmentCodes.get(segment) !== undefined;
  }

  /**
   * Returns the code of the given segment VM string.
   * If not exists, returns UNKNOWN_SEGMENT.
   */
  public segmentVMStringToCode(segment: string): number {
    const result: number = this.segmentCodes.get(segment);
    return result !== undefined ? result : HVMInstructionSet.UNKNOWN_SEGMENT;
  }

  /**
   * Returns the hardware pointer name of the given segment VM string.
   * If not exists, returns null.
   */
  public segmentStringVMToPointer(segment: string): string {
    return this.segmentPointerStrings.get(segment);
  }

  /**
   * Returns the code of the given segment VM string.
   * If not exists, returns null.
   */
  public segmentCodeToVMString(code: number): string {
    return this.segmentStrings.get(code);
  }

  // initializes the instructions table
  private initInstructions(): void {
    this.instructionToCode = new Hashtable();
    this.instructionToCode.put(
      HVMInstructionSet.ADD_STRING,
      HVMInstructionSet.ADD_CODE,
    );
    this.instructionToCode.put(
      HVMInstructionSet.SUBSTRACT_STRING,
      HVMInstructionSet.SUBSTRACT_CODE,
    );
    this.instructionToCode.put(
      HVMInstructionSet.NEGATE_STRING,
      HVMInstructionSet.NEGATE_CODE,
    );
    this.instructionToCode.put(
      HVMInstructionSet.EQUAL_STRING,
      HVMInstructionSet.EQUAL_CODE,
    );
    this.instructionToCode.put(
      HVMInstructionSet.GREATER_THAN_STRING,
      HVMInstructionSet.GREATER_THAN_CODE,
    );
    this.instructionToCode.put(
      HVMInstructionSet.LESS_THAN_STRING,
      HVMInstructionSet.LESS_THAN_CODE,
    );
    this.instructionToCode.put(
      HVMInstructionSet.AND_STRING,
      HVMInstructionSet.AND_CODE,
    );
    this.instructionToCode.put(
      HVMInstructionSet.OR_STRING,
      HVMInstructionSet.OR_CODE,
    );
    this.instructionToCode.put(
      HVMInstructionSet.NOT_STRING,
      HVMInstructionSet.NOT_CODE,
    );
    this.instructionToCode.put(
      HVMInstructionSet.PUSH_STRING,
      HVMInstructionSet.PUSH_CODE,
    );
    this.instructionToCode.put(
      HVMInstructionSet.POP_STRING,
      HVMInstructionSet.POP_CODE,
    );
    this.instructionToCode.put(
      HVMInstructionSet.LABEL_STRING,
      HVMInstructionSet.LABEL_CODE,
    );
    this.instructionToCode.put(
      HVMInstructionSet.GOTO_STRING,
      HVMInstructionSet.GOTO_CODE,
    );
    this.instructionToCode.put(
      HVMInstructionSet.IF_GOTO_STRING,
      HVMInstructionSet.IF_GOTO_CODE,
    );
    this.instructionToCode.put(
      HVMInstructionSet.FUNCTION_STRING,
      HVMInstructionSet.FUNCTION_CODE,
    );
    this.instructionToCode.put(
      HVMInstructionSet.RETURN_STRING,
      HVMInstructionSet.RETURN_CODE,
    );
    this.instructionToCode.put(
      HVMInstructionSet.CALL_STRING,
      HVMInstructionSet.CALL_CODE,
    );

    this.instructionToString = new Hashtable();
    this.instructionToString.put(
      HVMInstructionSet.ADD_CODE,
      HVMInstructionSet.ADD_STRING,
    );
    this.instructionToString.put(
      HVMInstructionSet.SUBSTRACT_CODE,
      HVMInstructionSet.SUBSTRACT_STRING,
    );
    this.instructionToString.put(
      HVMInstructionSet.NEGATE_CODE,
      HVMInstructionSet.NEGATE_STRING,
    );
    this.instructionToString.put(
      HVMInstructionSet.EQUAL_CODE,
      HVMInstructionSet.EQUAL_STRING,
    );
    this.instructionToString.put(
      HVMInstructionSet.GREATER_THAN_CODE,
      HVMInstructionSet.GREATER_THAN_STRING,
    );
    this.instructionToString.put(
      HVMInstructionSet.LESS_THAN_CODE,
      HVMInstructionSet.LESS_THAN_STRING,
    );
    this.instructionToString.put(
      HVMInstructionSet.AND_CODE,
      HVMInstructionSet.AND_STRING,
    );
    this.instructionToString.put(
      HVMInstructionSet.OR_CODE,
      HVMInstructionSet.OR_STRING,
    );
    this.instructionToString.put(
      HVMInstructionSet.NOT_CODE,
      HVMInstructionSet.NOT_STRING,
    );
    this.instructionToString.put(
      HVMInstructionSet.PUSH_CODE,
      HVMInstructionSet.PUSH_STRING,
    );
    this.instructionToString.put(
      HVMInstructionSet.POP_CODE,
      HVMInstructionSet.POP_STRING,
    );
    this.instructionToString.put(
      HVMInstructionSet.LABEL_CODE,
      HVMInstructionSet.LABEL_STRING,
    );
    this.instructionToString.put(
      HVMInstructionSet.GOTO_CODE,
      HVMInstructionSet.GOTO_STRING,
    );
    this.instructionToString.put(
      HVMInstructionSet.IF_GOTO_CODE,
      HVMInstructionSet.IF_GOTO_STRING,
    );
    this.instructionToString.put(
      HVMInstructionSet.FUNCTION_CODE,
      HVMInstructionSet.FUNCTION_STRING,
    );
    this.instructionToString.put(
      HVMInstructionSet.RETURN_CODE,
      HVMInstructionSet.RETURN_STRING,
    );
    this.instructionToString.put(
      HVMInstructionSet.CALL_CODE,
      HVMInstructionSet.CALL_STRING,
    );
  }

  // initializes the segment strings table
  private initSegmentStrings(): void {
    this.segmentPointerStrings = new Hashtable();
    this.segmentPointerStrings.put(
      HVMInstructionSet.LOCAL_SEGMENT_VM_STRING,
      Definitions.LOCAL_POINTER_NAME,
    );
    this.segmentPointerStrings.put(
      HVMInstructionSet.ARG_SEGMENT_VM_STRING,
      Definitions.ARG_POINTER_NAME,
    );
    this.segmentPointerStrings.put(
      HVMInstructionSet.THIS_SEGMENT_VM_STRING,
      Definitions.THIS_POINTER_NAME,
    );
    this.segmentPointerStrings.put(
      HVMInstructionSet.THAT_SEGMENT_VM_STRING,
      Definitions.THAT_POINTER_NAME,
    );

    this.segmentStrings = new Hashtable();
    this.segmentStrings.put(
      HVMInstructionSet.STATIC_SEGMENT_CODE,
      HVMInstructionSet.STATIC_SEGMENT_VM_STRING,
    );
    this.segmentStrings.put(
      HVMInstructionSet.LOCAL_SEGMENT_CODE,
      HVMInstructionSet.LOCAL_SEGMENT_VM_STRING,
    );
    this.segmentStrings.put(
      HVMInstructionSet.ARG_SEGMENT_CODE,
      HVMInstructionSet.ARG_SEGMENT_VM_STRING,
    );
    this.segmentStrings.put(
      HVMInstructionSet.THIS_SEGMENT_CODE,
      HVMInstructionSet.THIS_SEGMENT_VM_STRING,
    );
    this.segmentStrings.put(
      HVMInstructionSet.THAT_SEGMENT_CODE,
      HVMInstructionSet.THAT_SEGMENT_VM_STRING,
    );
    this.segmentStrings.put(
      HVMInstructionSet.TEMP_SEGMENT_CODE,
      HVMInstructionSet.TEMP_SEGMENT_VM_STRING,
    );
    this.segmentStrings.put(
      HVMInstructionSet.CONST_SEGMENT_CODE,
      HVMInstructionSet.CONST_SEGMENT_VM_STRING,
    );
    this.segmentStrings.put(
      HVMInstructionSet.POINTER_SEGMENT_CODE,
      HVMInstructionSet.POINTER_SEGMENT_VM_STRING,
    );
  }

  // initializes the segment codes table
  private initSegmentCodes(): void {
    this.segmentCodes = new Hashtable();
    this.segmentCodes.put(
      HVMInstructionSet.STATIC_SEGMENT_VM_STRING,
      HVMInstructionSet.STATIC_SEGMENT_CODE,
    );
    this.segmentCodes.put(
      HVMInstructionSet.LOCAL_SEGMENT_VM_STRING,
      HVMInstructionSet.LOCAL_SEGMENT_CODE,
    );
    this.segmentCodes.put(
      HVMInstructionSet.ARG_SEGMENT_VM_STRING,
      HVMInstructionSet.ARG_SEGMENT_CODE,
    );
    this.segmentCodes.put(
      HVMInstructionSet.THIS_SEGMENT_VM_STRING,
      HVMInstructionSet.THIS_SEGMENT_CODE,
    );
    this.segmentCodes.put(
      HVMInstructionSet.THAT_SEGMENT_VM_STRING,
      HVMInstructionSet.THAT_SEGMENT_CODE,
    );
    this.segmentCodes.put(
      HVMInstructionSet.TEMP_SEGMENT_VM_STRING,
      HVMInstructionSet.TEMP_SEGMENT_CODE,
    );
    this.segmentCodes.put(
      HVMInstructionSet.CONST_SEGMENT_VM_STRING,
      HVMInstructionSet.CONST_SEGMENT_CODE,
    );
    this.segmentCodes.put(
      HVMInstructionSet.POINTER_SEGMENT_VM_STRING,
      HVMInstructionSet.POINTER_SEGMENT_CODE,
    );
  }
}

export default HVMInstructionSet;
