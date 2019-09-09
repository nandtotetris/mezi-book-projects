import Hashtable from '../Common/Hashtable';
/**
 * Hack definitions and services. Designed as a singleton.
 */
// tslint:disable: member-ordering
class Definitions {
  // screen size
  private static readonly SCREEN_WIDTH_IN_WORDS: number = 32;
  private static readonly SCREEN_HEIGHT_IN_WORDS: number = 256;

  /**
   * Current software version
   */
  public static readonly version: string = '2.5';

  /**
   * Size of RAM
   */
  public static readonly RAM_SIZE: number = 24577;

  /**
   * Size of ROM
   */
  public static readonly ROM_SIZE: number = 32768;

  /**
   * Number of bits per memory word
   */
  public static readonly BITS_PER_WORD: number = 16;

  /**
   * Number of words in the screen
   */
  public static readonly SCREEN_SIZE_IN_WORDS: number =
    Definitions.SCREEN_WIDTH_IN_WORDS * Definitions.SCREEN_HEIGHT_IN_WORDS;

  /**
   * Screen width in pixels
   */
  public static readonly SCREEN_WIDTH: number =
    Definitions.SCREEN_WIDTH_IN_WORDS * Definitions.BITS_PER_WORD;

  /**
   * Screen width in pixels (=words)
   */
  public static readonly SCREEN_HEIGHT: number =
    Definitions.SCREEN_HEIGHT_IN_WORDS;

  /**
   * Total number of pixels in the screen
   */
  public static readonly SCREEN_SIZE: number =
    Definitions.SCREEN_WIDTH * Definitions.SCREEN_HEIGHT;

  /**
   * Address of the beginning of variable storage area
   */
  public static readonly VAR_START_ADDRESS: number = 16;

  /**
   * Address of the end of variable storage area
   */
  public static readonly VAR_END_ADDRESS: number = 255;

  // Memory segments

  /**
   * The start address of the global stack
   */
  public static readonly STACK_START_ADDRESS: number = 256;

  /**
   * The end address of the global stack
   */
  public static readonly STACK_END_ADDRESS: number = 2047;

  /**
   * The start address of the heap
   */
  public static readonly HEAP_START_ADDRESS: number = 2048;

  /**
   * The end address of the heap
   */
  public static readonly HEAP_END_ADDRESS: number = 16383;

  /**
   * The start address of the screen
   */
  public static readonly SCREEN_START_ADDRESS: number = 16384;

  /**
   * The end address of the screen
   */
  public static readonly SCREEN_END_ADDRESS: number =
    Definitions.SCREEN_START_ADDRESS + Definitions.SCREEN_SIZE_IN_WORDS;

  /**
   * The address of the memory-mapped keyboard
   */
  public static readonly KEYBOARD_ADDRESS: number = 24576;

  /**
   * The start address of the temp memory segment
   */
  public static readonly TEMP_START_ADDRESS: number = 5;

  /**
   * The end address of the temp memory segment
   */
  public static readonly TEMP_END_ADDRESS: number = 12;

  // pointers addresses

  /**
   * The address of the SP regsiter
   */
  public static readonly SP_ADDRESS: number = 0;

  /**
   * The address of the LOCAL regsiter
   */
  public static readonly LOCAL_POINTER_ADDRESS: number = 1;

  /**
   * The address of the ARG regsiter
   */
  public static readonly ARG_POINTER_ADDRESS: number = 2;

  /**
   * The address of the THIS regsiter
   */
  public static readonly THIS_POINTER_ADDRESS: number = 3;

  /**
   * The address of the THAT regsiter
   */
  public static readonly THAT_POINTER_ADDRESS: number = 4;

  // Register addresses

  /**
   * The address of the R0 register
   */
  public static readonly R0_ADDRESS: number = 0;

  /**
   * The address of the R1 register
   */
  public static readonly R1_ADDRESS: number = 1;

  /**
   * The address of the R2 register
   */
  public static readonly R2_ADDRESS: number = 2;

  /**
   * The address of the R3 register
   */
  public static readonly R3_ADDRESS: number = 3;

  /**
   * The address of the R4 register
   */
  public static readonly R4_ADDRESS: number = 4;

  /**
   * The address of the R5 register
   */
  public static readonly R5_ADDRESS: number = 5;

  /**
   * The address of the R6 register
   */
  public static readonly R6_ADDRESS: number = 6;

  /**
   * The address of the R7 register
   */
  public static readonly R7_ADDRESS: number = 7;

  /**
   * The address of the R8 register
   */
  public static readonly R8_ADDRESS: number = 8;

  /**
   * The address of the R9 register
   */
  public static readonly R9_ADDRESS: number = 9;

  /**
   * The address of the R10 register
   */
  public static readonly R10_ADDRESS: number = 10;

  /**
   * The address of the R11 register
   */
  public static readonly R11_ADDRESS: number = 11;

  /**
   * The address of the R12 register
   */
  public static readonly R12_ADDRESS: number = 12;

  /**
   * The address of the R13 register
   */
  public static readonly R13_ADDRESS: number = 13;

  /**
   * The address of the R14 register
   */
  public static readonly R14_ADDRESS: number = 14;

  /**
   * The address of the R15 register
   */
  public static readonly R15_ADDRESS: number = 15;

  /**
   * Symbolizes an unknown address
   */
  public static readonly UNKNOWN_ADDRESS: number = -1;

  // Assembly symbols

  /**
   * The name of the screen assembly symbol
   */
  public static readonly SCREEN_NAME: string = 'SCREEN';

  /**
   * The name of the keybaord assembly symbol
   */
  public static readonly KEYBOARD_NAME: string = 'KBD';

  /**
   * The name of the stack pointer assembly symbol
   */
  public static readonly SP_NAME: string = 'SP';

  /**
   * The name of the local register assembly symbol
   */
  public static readonly LOCAL_POINTER_NAME: string = 'LCL';

  /**
   * The name of the argumet register assembly symbol
   */
  public static readonly ARG_POINTER_NAME: string = 'ARG';

  /**
   * The name of the "this" register assembly symbol
   */
  public static readonly THIS_POINTER_NAME: string = 'THIS';

  /**
   * The name of the "that" register assembly symbol
   */
  public static readonly THAT_POINTER_NAME: string = 'THAT';

  /**
   * The name of the R0 register assembly symbol
   */
  public static readonly R0_NAME: string = 'R0';

  /**
   * The name of the R1 register assembly symbol
   */
  public static readonly R1_NAME: string = 'R1';

  /**
   * The name of the R2 register assembly symbol
   */
  public static readonly R2_NAME: string = 'R2';

  /**
   * The name of the R3 register assembly symbol
   */
  public static readonly R3_NAME: string = 'R3';

  /**
   * The name of the R4 register assembly symbol
   */
  public static readonly R4_NAME: string = 'R4';

  /**
   * The name of the R5 register assembly symbol
   */
  public static readonly R5_NAME: string = 'R5';

  /**
   * The name of the R6 register assembly symbol
   */
  public static readonly R6_NAME: string = 'R6';

  /**
   * The name of the R7 register assembly symbol
   */
  public static readonly R7_NAME: string = 'R7';

  /**
   * The name of the R8 register assembly symbol
   */
  public static readonly R8_NAME: string = 'R8';

  /**
   * The name of the R9 register assembly symbol
   */
  public static readonly R9_NAME: string = 'R9';

  /**
   * The name of the R10 register assembly symbol
   */
  public static readonly R10_NAME: string = 'R10';

  /**
   * The name of the R11 register assembly symbol
   */
  public static readonly R11_NAME: string = 'R11';

  /**
   * The name of the R12 register assembly symbol
   */
  public static readonly R12_NAME: string = 'R12';

  /**
   * The name of the R13 register assembly symbol
   */
  public static readonly R13_NAME: string = 'R13';

  /**
   * The name of the R14 register assembly symbol
   */
  public static readonly R14_NAME: string = 'R14';

  /**
   * The name of the R15 register assembly symbol
   */
  public static readonly R15_NAME: string = 'R15';

  // Key codes
  public static readonly NEWLINE_KEY: number = 128;
  public static readonly BACKSPACE_KEY: number = 129;
  public static readonly LEFT_KEY: number = 130;
  public static readonly UP_KEY: number = 131;
  public static readonly RIGHT_KEY: number = 132;
  public static readonly DOWN_KEY: number = 133;
  public static readonly HOME_KEY: number = 134;
  public static readonly END_KEY: number = 135;
  public static readonly PAGE_UP_KEY: number = 136;
  public static readonly PAGE_DOWN_KEY: number = 137;
  public static readonly INSERT_KEY: number = 138;
  public static readonly DELETE_KEY: number = 139;
  public static readonly ESC_KEY: number = 140;
  public static readonly F1_KEY: number = 141;
  public static readonly F2_KEY: number = 142;
  public static readonly F3_KEY: number = 143;
  public static readonly F4_KEY: number = 144;
  public static readonly F5_KEY: number = 145;
  public static readonly F6_KEY: number = 146;
  public static readonly F7_KEY: number = 147;
  public static readonly F8_KEY: number = 148;
  public static readonly F9_KEY: number = 149;
  public static readonly F10_KEY: number = 150;
  public static readonly F11_KEY: number = 151;
  public static readonly F12_KEY: number = 152;

  /**
   * Returns the single instance of the definitions object.
   */
  static getInstance(): Definitions {
    if (Definitions.instance === null) {
      Definitions.instance = new Definitions();
    }
    return Definitions.instance;
  }

  /**
   * Computes an ALU's command with the given information and returns the result.
   * input0, input1 - the two ALU inputs.
   * zero0 - if true, zeros input0 before operation
   * zero1 - if true, zeros input1 before operation
   * negate0 - if true, negates input0 before operation
   * negate1 - if true, negates input1 before operation
   * ADDorAND - if true, ADDs the inputs. Otherwise, ANDs the inputs (logical AND)
   * negateOutput - if true, negates the output after the operation.
   */
  public static computeALU(
    input0: number,
    input1: number,
    zero0: boolean,
    negate0: boolean,
    zero1: boolean,
    negate1: boolean,
    ADDorAND: boolean,
    negateOutput: boolean,
  ): number {
    let result: number;

    if (zero0) {
      input0 = 0;
    }
    if (zero1) {
      input1 = 0;
    }
    if (negate0) {
      // tslint:disable-next-line: no-bitwise
      input0 = ~input0;
    }
    if (negate1) {
      // tslint:disable-next-line: no-bitwise
      input1 = ~input1;
    }
    if (ADDorAND) {
      result = input0 + input1;
    } else {
      // tslint:disable-next-line: no-bitwise
      result = input0 & input1;
    }
    if (negateOutput) {
      // tslint:disable-next-line: no-bitwise
      result = ~result;
    }

    return result;
  }

  // the single instance
  private static instance: Definitions | null = null;

  // the translation table from pointer names to addresses
  private addresses: Hashtable = new Hashtable();

  // translation table for action key codes
  private actionKeyCodes: number[] = [];

  // Constructor: initializes addresses and key codes.
  constructor() {
    this.initAddresses();
    this.initKeyCodes();
  }

  /**
   * Returns the translation table from pointer names to addresses.
   */
  public getAddressesTable(): Hashtable {
    const addressTable: Hashtable = new Hashtable();
    addressTable.setTable(this.addresses.getTable());
    return addressTable;
  }

  /**
   * Returns the hack key code from the given key event.
   */
  public getKeyCode(e: KeyboardEvent): number {
    let key: number = 0;
    const code: number = e.keyCode;

    if (this.actionKeyCodes[code]) {
      key = this.actionKeyCodes[code];
    } else {
      key = code;
    }

    return key;
  }

  /**
   * Returns the key name from the given key event.
   */
  public getKeyName(e: KeyboardEvent): string {
    return e.code;
  }

  // initializes address translation table
  private initAddresses() {
    this.addresses = new Hashtable();
    this.addresses.put(Definitions.SP_NAME, Definitions.SP_ADDRESS);
    this.addresses.put(
      Definitions.LOCAL_POINTER_NAME,
      Definitions.LOCAL_POINTER_ADDRESS,
    );
    this.addresses.put(
      Definitions.ARG_POINTER_NAME,
      Definitions.ARG_POINTER_ADDRESS,
    );
    this.addresses.put(
      Definitions.THIS_POINTER_NAME,
      Definitions.THIS_POINTER_ADDRESS,
    );
    this.addresses.put(
      Definitions.THAT_POINTER_NAME,
      Definitions.THAT_POINTER_ADDRESS,
    );
    this.addresses.put(Definitions.R0_NAME, Definitions.R0_ADDRESS);
    this.addresses.put(Definitions.R1_NAME, Definitions.R1_ADDRESS);
    this.addresses.put(Definitions.R2_NAME, Definitions.R2_ADDRESS);
    this.addresses.put(Definitions.R3_NAME, Definitions.R3_ADDRESS);
    this.addresses.put(Definitions.R4_NAME, Definitions.R4_ADDRESS);
    this.addresses.put(Definitions.R5_NAME, Definitions.R5_ADDRESS);
    this.addresses.put(Definitions.R6_NAME, Definitions.R6_ADDRESS);
    this.addresses.put(Definitions.R7_NAME, Definitions.R7_ADDRESS);
    this.addresses.put(Definitions.R8_NAME, Definitions.R8_ADDRESS);
    this.addresses.put(Definitions.R9_NAME, Definitions.R9_ADDRESS);
    this.addresses.put(Definitions.R10_NAME, Definitions.R10_ADDRESS);
    this.addresses.put(Definitions.R11_NAME, Definitions.R11_ADDRESS);
    this.addresses.put(Definitions.R12_NAME, Definitions.R12_ADDRESS);
    this.addresses.put(Definitions.R13_NAME, Definitions.R13_ADDRESS);
    this.addresses.put(Definitions.R14_NAME, Definitions.R14_ADDRESS);
    this.addresses.put(Definitions.R15_NAME, Definitions.R15_ADDRESS);
    this.addresses.put(
      Definitions.SCREEN_NAME,
      Definitions.SCREEN_START_ADDRESS,
    );
    this.addresses.put(Definitions.KEYBOARD_NAME, Definitions.KEYBOARD_ADDRESS);
  }

  // prepare map of action keys from javascript codes to jack codes
  private initKeyCodes() {
    this.actionKeyCodes[8] = Definitions.BACKSPACE_KEY;
    this.actionKeyCodes[13] = Definitions.NEWLINE_KEY;
    this.actionKeyCodes[27] = Definitions.ESC_KEY;
    this.actionKeyCodes[33] = Definitions.PAGE_UP_KEY;
    this.actionKeyCodes[34] = Definitions.PAGE_DOWN_KEY;
    this.actionKeyCodes[35] = Definitions.END_KEY;
    this.actionKeyCodes[36] = Definitions.HOME_KEY;
    this.actionKeyCodes[37] = Definitions.LEFT_KEY;
    this.actionKeyCodes[38] = Definitions.UP_KEY;
    this.actionKeyCodes[39] = Definitions.RIGHT_KEY;
    this.actionKeyCodes[40] = Definitions.DOWN_KEY;
    this.actionKeyCodes[45] = Definitions.INSERT_KEY;
    this.actionKeyCodes[46] = Definitions.DELETE_KEY;
    this.actionKeyCodes[112] = Definitions.F1_KEY;
    this.actionKeyCodes[113] = Definitions.F2_KEY;
    this.actionKeyCodes[114] = Definitions.F3_KEY;
    this.actionKeyCodes[115] = Definitions.F4_KEY;
    this.actionKeyCodes[116] = Definitions.F5_KEY;
    this.actionKeyCodes[117] = Definitions.F6_KEY;
    this.actionKeyCodes[118] = Definitions.F7_KEY;
    this.actionKeyCodes[119] = Definitions.F8_KEY;
    this.actionKeyCodes[120] = Definitions.F9_KEY;
    this.actionKeyCodes[121] = Definitions.F10_KEY;
    this.actionKeyCodes[122] = Definitions.F11_KEY;
    this.actionKeyCodes[123] = Definitions.F12_KEY;
  }
}

export default Definitions;
