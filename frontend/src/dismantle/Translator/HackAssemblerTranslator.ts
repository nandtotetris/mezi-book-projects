import Hashtable from '../Common/Hashtable';
import Conversions from '../Utilities/Conversions';
import AssemblyLineTokenizer from './AssemblyLineTokenizer';
// tslint:disable-next-line: no-circular-imports
import HackAssembler from './HackAssembler';
import { AssemblerException } from './types';

/**
 * A translation service between the Assembly text and the numeric instruction values.
 * The translation is bidirectional.
 * This is a singlton class.
 */
class HackAssemblerTranslator {
  /**
   * Indicates an assembly line with no operation
   */
  public static readonly NOP: number = 0x8000;

  /**
   * Returns the single instance of the translator.
   */
  public static getInstance(): HackAssemblerTranslator {
    if (HackAssemblerTranslator.instance === null) {
      return new HackAssemblerTranslator();
    }
    return HackAssemblerTranslator.instance;
  }

  /**
   * Loads the given program file (HACK or ASM) and returns a memory array of
   * the given size that contains the program. The given null value will be used
   * to fill the memory array initially.
   */
  public static loadProgram(
    fileName: string,
    size: number,
    nullValue: number,
  ): number[] {
    let memory: number[] = [];

    const file: string | null = localStorage.getItem(fileName);

    if (file === null) {
      throw new AssemblerException(fileName + " doesn't exist");
    }

    if (fileName.endsWith('.hack')) {
      memory = [];
      for (let i = 0; i < size; i++) {
        memory[i] = nullValue;
      }

      try {
        let pc: number = 0;

        const lines: string[] = file.split('\n');
        for (const line of lines) {
          let value: number = 0;

          if (pc >= size) {
            throw new AssemblerException('Program too large');
          }

          try {
            value = Conversions.binaryToInt(line);
          } catch {
            throw new AssemblerException('Illegal character');
          }

          memory[pc++] = value;
        }
      } catch {
        throw new AssemblerException('IO error while reading ' + fileName);
      }
    } else if (fileName.endsWith('.asm')) {
      try {
        const assembler: HackAssembler = new HackAssembler(
          fileName,
          size,
          nullValue,
          false,
        );
        memory = assembler.getProgram();
      } catch (ae) {
        throw new AssemblerException(ae.message);
      }
    } else {
      throw new AssemblerException(fileName + ' is not a .hack or .asm file');
    }

    return memory;
  }

  // exp constants
  private static readonly ZERO: number = 0xea80;
  private static readonly ONE: number = 0xefc0;
  private static readonly MINUS_ONE: number = 0xee80;
  private static readonly EXP_D: number = 0xe300;
  private static readonly NOT_D: number = 0xe340;
  private static readonly EXP_M: number = 0xfc00;
  private static readonly EXP_A: number = 0xec00;
  private static readonly NOT_M: number = 0xfc40;
  private static readonly NOT_A: number = 0xec40;
  private static readonly MINUS_D: number = 0xe3c0;
  private static readonly MINUS_M: number = 0xfcc0;
  private static readonly MINUS_A: number = 0xecc0;
  private static readonly D_PLUS_ONE: number = 0xe7c0;
  private static readonly M_PLUS_ONE: number = 0xfdc0;
  private static readonly A_PLUS_ONE: number = 0xedc0;
  private static readonly D_MINUS_ONE: number = 0xe380;
  private static readonly M_MINUS_ONE: number = 0xfc80;
  private static readonly A_MINUS_ONE: number = 0xec80;
  private static readonly D_PLUS_M: number = 0xf080;
  private static readonly D_PLUS_A: number = 0xe080;
  private static readonly D_MINUS_M: number = 0xf4c0;
  private static readonly D_MINUS_A: number = 0xe4c0;
  private static readonly M_MINUS_D: number = 0xf1c0;
  private static readonly A_MINUS_D: number = 0xe1c0;
  private static readonly D_AND_M: number = 0xf000;
  private static readonly D_AND_A: number = 0xe000;
  private static readonly D_OR_M: number = 0xf540;
  private static readonly D_OR_A: number = 0xe540;

  // dest constants
  private static readonly A: number = 0x20;
  private static readonly M: number = 0x8;
  private static readonly D: number = 0x10;
  private static readonly AM: number = 0x28;
  private static readonly AD: number = 0x30;
  private static readonly MD: number = 0x18;
  private static readonly AMD: number = 0x38;

  // jmp constants
  private static readonly JMP: number = 0x7;
  private static readonly JMP_LESS_THEN: number = 0x4;
  private static readonly JMP_EQUAL: number = 0x2;
  private static readonly JMP_GREATER_THEN: number = 0x1;
  private static readonly JMP_NOT_EQUAL: number = 0x5;
  private static readonly JMP_LESS_EQUAL: number = 0x6;
  private static readonly JMP_GREATER_EQUAL: number = 0x3;

  // the single instance
  private static instance: HackAssemblerTranslator | null = null;

  // The translation tables from text to codes
  private expToCode: Hashtable = new Hashtable();
  private destToCode: Hashtable = new Hashtable();
  private jmpToCode: Hashtable = new Hashtable();

  // The translation table from code to text.
  private expToText: Hashtable = new Hashtable();
  private destToText: Hashtable = new Hashtable();
  private jmpToText: Hashtable = new Hashtable();

  /**
   * Creates a new translator.
   */
  private constructor() {
    HackAssemblerTranslator.instance = this;
    this.initExp();
    this.initDest();
    this.initJmp();
  }

  /**
   * Returns the code which represents the given exp text.
   * If doesn't exist, throws AssemblerException.
   */
  public getExpByText(text: string): number {
    const code: number = this.expToCode.get(text);
    if (code === undefined) {
      throw new AssemblerException('Illegal exp: ' + text);
    }
    return code;
  }

  /**
   * Returns the text which represents the given exp code.
   * If doesn't exist, throws AssemblerException.
   */
  public getExpByCode(code: number): string {
    const result: string = this.expToText.get(code);
    if (result === undefined) {
      throw new AssemblerException('Illegal exp: ' + code);
    }
    return result;
  }

  /**
   * Returns the code which represents the given dest text.
   * If doesn't exist, throws AssemblerException.
   */
  public getDestByText(text: string): number {
    const code: number = this.destToCode.get(text);
    if (code === undefined) {
      throw new AssemblerException('Illegal dest: ' + text);
    }
    return code;
  }

  /**
   * Returns the text which represents the given dest code.
   * If doesn't exist, throws AssemblerException.
   */
  public getDestByCode(code: number): string {
    const result: string = this.destToText.get(code);
    if (result === undefined) {
      throw new AssemblerException('Illegal dest: ' + code);
    }
    return result;
  }

  /**
   * Returns the code which represents the given jmp text.
   * If doesn't exist, throws AssemblerException.
   */
  public getJmpByText(text: string): number {
    const code: number = this.jmpToCode.get(text);
    if (code === undefined) {
      throw new AssemblerException('Illegal jmp: ' + text);
    }
    return code;
  }

  /**
   * Returns the text which represents the given jmp code.
   * If doesn't exist, throws AssemblerException.
   */
  public getJmpByCode(code: number): string {
    const result: string = this.jmpToText.get(code);
    if (result === undefined) {
      throw new AssemblerException('Illegal jmp: ' + code);
    }
    return result;
  }

  /**
   * Translates the given assembly language command and returns the corresponding
   * machine language code.
   * If the command is not legal, throws AssemblerException.
   */
  public textToCode(command: string): number {
    let code: number = 0;
    let expCode: number = 0;
    let jmpCode: number = 0;
    let destCode: number = 0;

    try {
      // The tokenizer upon intialization, captures the first token
      const input: AssemblyLineTokenizer = new AssemblyLineTokenizer(command);

      // parse address instructions, that start with @
      if (input.isToken('@')) {
        // get the address value
        input.advance(true);
        // since supposedly symbols are replaced with their values (using the symbol table),
        // address value should now be a number
        code = parseInt(input.token(), 10);
        if (isNaN(code)) {
          throw new AssemblerException('A numeric value is expected');
        }
      } else {
        // compute-store-jump command
        const firstToken: string = input.token();
        // cannot expect token (expectToken=false), because both dest and jump part of
        // the instruction are optional
        input.advance(false);
        // find dest (if any)
        if (input.isToken('=')) {
          const dest: number = this.destToCode.get(firstToken);
          if (dest === undefined) {
            throw new AssemblerException('Destination expected');
          }

          destCode = dest;

          // if there was destination, then source is expected
          input.advance(true);
        }
        // find exp, it is what is left (whether there was destination or not)
        let exp: number;
        let expText: string;
        if (firstToken !== '=' && destCode === 0) {
          // a single compute command like 0 or D
          exp = this.expToCode.get(firstToken);
          expText = firstToken;
        } else {
          exp = this.expToCode.get(input.token());
          expText = input.token();
        }

        if (exp === undefined) {
          throw new AssemblerException('Expression expected');
        }
        expCode = exp;
        // cannot expect jump, since it is optional
        input.advance(false);

        if (input.isToken(';')) {
          // even after semicolon, jump is optional
          input.advance(false);
        }

        // find jmp (if any)
        if (!input.isEnd()) {
          const jmp: number = this.jmpToCode.get(input.token());
          if (jmp === undefined) {
            throw new AssemblerException('Jump directive expected');
          }
          jmpCode = jmp;
          // make sure there isn't anything after the jmp command
          input.ensureEnd();
        }

        code = destCode + expCode + jmpCode;
      }
    } catch (e) {
      throw new AssemblerException(
        'Error while parsing assembly line: ' + e.message,
      );
    }

    return code;
  }

  /**
   * Translates the given machine language code and returns the corresponding Assembly
   * language command (String).
   * If illegal, throws AssemblerException.
   */
  public codeToText(code: number): string {
    let command: string = '';

    if (code !== HackAssemblerTranslator.NOP) {
      // tslint:disable-next-line: no-bitwise
      if ((code & 0x8000) === 0) {
        command += '@';
        command += code;
      } else {
        // tslint:disable-next-line: no-bitwise
        const exp: number = code & 0xffc0;
        // tslint:disable-next-line: no-bitwise
        const dest: number = code & 0x0038;
        // tslint:disable-next-line: no-bitwise
        const jmp: number = code & 0x0007;

        const expText: string = this.getExpByCode(exp);
        if (expText !== '') {
          if (dest !== 0) {
            command += this.getDestByCode(dest);
            command += '=';
          }

          command += expText;

          if (jmp !== 0) {
            command += ';';
            command += this.getJmpByCode(jmp);
          }
        }
      }
    }

    return command;
  }

  // initializes the exp table
  private initExp() {
    this.expToCode = new Hashtable();
    this.expToText = new Hashtable();

    this.expToCode.put('0', HackAssemblerTranslator.ZERO);
    this.expToCode.put('1', HackAssemblerTranslator.ONE);
    this.expToCode.put('-1', HackAssemblerTranslator.MINUS_ONE);
    this.expToCode.put('D', HackAssemblerTranslator.EXP_D);
    this.expToCode.put('!D', HackAssemblerTranslator.NOT_D);
    this.expToCode.put('NOTD', HackAssemblerTranslator.NOT_D);
    this.expToCode.put('M', HackAssemblerTranslator.EXP_M);
    this.expToCode.put('A', HackAssemblerTranslator.EXP_A);
    this.expToCode.put('!M', HackAssemblerTranslator.NOT_M);
    this.expToCode.put('NOTM', HackAssemblerTranslator.NOT_M);
    this.expToCode.put('!A', HackAssemblerTranslator.NOT_A);
    this.expToCode.put('NOTA', HackAssemblerTranslator.NOT_A);
    this.expToCode.put('-D', HackAssemblerTranslator.MINUS_D);
    this.expToCode.put('-M', HackAssemblerTranslator.MINUS_M);
    this.expToCode.put('-A', HackAssemblerTranslator.MINUS_A);
    this.expToCode.put('D+1', HackAssemblerTranslator.D_PLUS_ONE);
    this.expToCode.put('M+1', HackAssemblerTranslator.M_PLUS_ONE);
    this.expToCode.put('A+1', HackAssemblerTranslator.A_PLUS_ONE);
    this.expToCode.put('D-1', HackAssemblerTranslator.D_MINUS_ONE);
    this.expToCode.put('M-1', HackAssemblerTranslator.M_MINUS_ONE);
    this.expToCode.put('A-1', HackAssemblerTranslator.A_MINUS_ONE);
    this.expToCode.put('D+M', HackAssemblerTranslator.D_PLUS_M);
    this.expToCode.put('M+D', HackAssemblerTranslator.D_PLUS_M);
    this.expToCode.put('D+A', HackAssemblerTranslator.D_PLUS_A);
    this.expToCode.put('A+D', HackAssemblerTranslator.D_PLUS_A);
    this.expToCode.put('D-M', HackAssemblerTranslator.D_MINUS_M);
    this.expToCode.put('D-A', HackAssemblerTranslator.D_MINUS_A);
    this.expToCode.put('M-D', HackAssemblerTranslator.M_MINUS_D);
    this.expToCode.put('A-D', HackAssemblerTranslator.A_MINUS_D);
    this.expToCode.put('D&M', HackAssemblerTranslator.D_AND_M);
    this.expToCode.put('M&D', HackAssemblerTranslator.D_AND_M);
    this.expToCode.put('D&A', HackAssemblerTranslator.D_AND_A);
    this.expToCode.put('A&D', HackAssemblerTranslator.D_AND_A);
    this.expToCode.put('D|M', HackAssemblerTranslator.D_OR_M);
    this.expToCode.put('M|D', HackAssemblerTranslator.D_OR_M);
    this.expToCode.put('D|A', HackAssemblerTranslator.D_OR_A);
    this.expToCode.put('A|D', HackAssemblerTranslator.D_OR_A);

    this.expToText.put(HackAssemblerTranslator.ZERO, '0');
    this.expToText.put(HackAssemblerTranslator.ONE, '1');
    this.expToText.put(HackAssemblerTranslator.MINUS_ONE, '-1');
    this.expToText.put(HackAssemblerTranslator.EXP_D, 'D');
    this.expToText.put(HackAssemblerTranslator.NOT_D, '!D');
    this.expToText.put(HackAssemblerTranslator.EXP_M, 'M');
    this.expToText.put(HackAssemblerTranslator.EXP_A, 'A');
    this.expToText.put(HackAssemblerTranslator.NOT_M, '!M');
    this.expToText.put(HackAssemblerTranslator.NOT_A, '!A');
    this.expToText.put(HackAssemblerTranslator.MINUS_D, '-D');
    this.expToText.put(HackAssemblerTranslator.MINUS_M, '-M');
    this.expToText.put(HackAssemblerTranslator.MINUS_A, '-A');
    this.expToText.put(HackAssemblerTranslator.D_PLUS_ONE, 'D+1');
    this.expToText.put(HackAssemblerTranslator.M_PLUS_ONE, 'M+1');
    this.expToText.put(HackAssemblerTranslator.A_PLUS_ONE, 'A+1');
    this.expToText.put(HackAssemblerTranslator.D_MINUS_ONE, 'D-1');
    this.expToText.put(HackAssemblerTranslator.M_MINUS_ONE, 'M-1');
    this.expToText.put(HackAssemblerTranslator.A_MINUS_ONE, 'A-1');
    this.expToText.put(HackAssemblerTranslator.D_PLUS_M, 'D+M');
    this.expToText.put(HackAssemblerTranslator.D_PLUS_A, 'D+A');
    this.expToText.put(HackAssemblerTranslator.D_MINUS_M, 'D-M');
    this.expToText.put(HackAssemblerTranslator.D_MINUS_A, 'D-A');
    this.expToText.put(HackAssemblerTranslator.M_MINUS_D, 'M-D');
    this.expToText.put(HackAssemblerTranslator.A_MINUS_D, 'A-D');
    this.expToText.put(HackAssemblerTranslator.D_AND_M, 'D&M');
    this.expToText.put(HackAssemblerTranslator.D_AND_A, 'D&A');
    this.expToText.put(HackAssemblerTranslator.D_OR_M, 'D|M');
    this.expToText.put(HackAssemblerTranslator.D_OR_A, 'D|A');
  }

  // initializes the dest table
  private initDest() {
    this.destToCode = new Hashtable();
    this.destToText = new Hashtable();

    this.destToCode.put('A', HackAssemblerTranslator.A);
    this.destToCode.put('M', HackAssemblerTranslator.M);
    this.destToCode.put('D', HackAssemblerTranslator.D);
    this.destToCode.put('AM', HackAssemblerTranslator.AM);
    this.destToCode.put('AD', HackAssemblerTranslator.AD);
    this.destToCode.put('MD', HackAssemblerTranslator.MD);
    this.destToCode.put('AMD', HackAssemblerTranslator.AMD);

    this.destToText.put(HackAssemblerTranslator.A, 'A');
    this.destToText.put(HackAssemblerTranslator.M, 'M');
    this.destToText.put(HackAssemblerTranslator.D, 'D');
    this.destToText.put(HackAssemblerTranslator.AM, 'AM');
    this.destToText.put(HackAssemblerTranslator.AD, 'AD');
    this.destToText.put(HackAssemblerTranslator.MD, 'MD');
    this.destToText.put(HackAssemblerTranslator.AMD, 'AMD');
  }

  // initializes the jmp table
  private initJmp() {
    this.jmpToCode = new Hashtable();
    this.jmpToText = new Hashtable();

    this.jmpToCode.put('JMP', HackAssemblerTranslator.JMP);
    this.jmpToCode.put('JLT', HackAssemblerTranslator.JMP_LESS_THEN);
    this.jmpToCode.put('JEQ', HackAssemblerTranslator.JMP_EQUAL);
    this.jmpToCode.put('JGT', HackAssemblerTranslator.JMP_GREATER_THEN);
    this.jmpToCode.put('JNE', HackAssemblerTranslator.JMP_NOT_EQUAL);
    this.jmpToCode.put('JLE', HackAssemblerTranslator.JMP_LESS_EQUAL);
    this.jmpToCode.put('JGE', HackAssemblerTranslator.JMP_GREATER_EQUAL);

    this.jmpToText.put(HackAssemblerTranslator.JMP, 'JMP');
    this.jmpToText.put(HackAssemblerTranslator.JMP_LESS_THEN, 'JLT');
    this.jmpToText.put(HackAssemblerTranslator.JMP_EQUAL, 'JEQ');
    this.jmpToText.put(HackAssemblerTranslator.JMP_GREATER_THEN, 'JGT');
    this.jmpToText.put(HackAssemblerTranslator.JMP_NOT_EQUAL, 'JNE');
    this.jmpToText.put(HackAssemblerTranslator.JMP_LESS_EQUAL, 'JLE');
    this.jmpToText.put(HackAssemblerTranslator.JMP_GREATER_EQUAL, 'JGE');
  }
}

export default HackAssemblerTranslator;
