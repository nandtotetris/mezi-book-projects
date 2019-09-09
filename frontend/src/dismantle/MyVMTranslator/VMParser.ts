import ProgramException from '../Controller/ProgramException';
import HVMInstruction from '../VirtualMachine/HVMInstruction';
import HVMInstructionSet from '../VirtualMachine/HVMInstructionSet';
import StringTokenizer from '../VMEmulator/SimpleStringTokenizer';

/**
 * A list of VM instructions, with a program counter.
 */
class VMParser {
  // A string array of the vm file names that will be parsed
  private stream: string[] = [];

  private currentInstruction: HVMInstruction | null = null;

  // The list of VM instructions
  private instructions: HVMInstruction[] = [];

  // The current instruction index while reading out
  private currentInstructionIndex: number = 0;

  private isFirstAccessMade: boolean = false;

  // Is the program currently being read in the middle of a /* */ comment?
  private isSlashStar: boolean = false;

  private instructionSet: HVMInstructionSet = HVMInstructionSet.getInstance();

  private isSysInitFound: boolean = false;

  /**
   * Opens the input file/stream and gets ready to parse it
   * In our specific case, it takes a list of names that serves as a local
   * storage key to possibly several vm files. The files are immediately read,
   * and parsed, and the list of instructions is populated ahead of time, before
   * the first advance call is made.
   */
  public constructor(stream: string[]) {
    this.stream = stream;
    this.reset();
    this.loadProgram(this.stream);
    // reposition index
    this.currentInstructionIndex = 0;
    // tslint:disable-next-line: no-console
    console.log(`Instruction length: ${this.instructions.length}`);
    for (const command of this.instructions) {
      if (command !== undefined) {
        // tslint:disable-next-line: no-console
        console.log(command.toString());
      }
    }
  }

  /**
   * Are there more commands in the input?
   */
  public hasMoreCommands(): boolean {
    return this.currentInstructionIndex + 1 < this.instructions.length;
  }

  public getCurrentInstruction(): HVMInstruction {
    return this.instructions[this.currentInstructionIndex];
  }

  /**
   * Reads the next command from the input and makes it the current command.
   * Should be called only if hasMoreCommands() is true. Initially there is
   * no current command.
   */
  public advance(): void {
    if (this.hasMoreCommands()) {
      if (this.isFirstAccessMade) {
        this.currentInstructionIndex++;
      } else {
        this.isFirstAccessMade = true;
      }
    }
  }

  /**
   * Returns the type of the current VM command. C_ARITHMETIC is returned for all
   * the arithmetic commands.
   * In our case, if code < 10, then it is C_ARITHMETIC
   */
  public commandType(): number {
    if (this.currentInstruction !== null) {
      return this.currentInstruction.getOpCode();
    }
    return HVMInstructionSet.UNKNOWN_INSTRUCTION;
  }

  /**
   * Returns the first argument of the current command. In the case of C_ARITHMETIC,
   * the command itself (add, sub, etc) is returned. Should not be called if the
   * current command is C_RETURN.
   */
  public arg1(): string {
    if (this.currentInstruction) {
      const opcode = this.currentInstruction.getOpCode();
      if (opcode === HVMInstructionSet.RETURN_CODE) {
        throw new ProgramException(
          'arg1 should not be called for return command type',
        );
      }
      if (opcode < 10) {
        return this.instructionSet.instructionCodeToString(
          this.currentInstruction.getOpCode(),
        );
      } else {
        return this.currentInstruction.getStringArg();
      }
    } else {
      throw new ProgramException('arg1 called on non-existent instruction');
    }
  }

  /**
   * Returns the second argument of the current command. Should be called only if the
   * current command is C_PUSH, C_POP, C_FUNCTION, or C_CALL.
   */
  public arg2(): number {
    if (this.currentInstruction) {
      const opcode = this.currentInstruction.getOpCode();
      const codeString = this.instructionSet.instructionCodeToString(
        this.currentInstruction.getOpCode(),
      );
      if (
        opcode === HVMInstructionSet.POP_CODE ||
        opcode === HVMInstructionSet.PUSH_CODE ||
        opcode === HVMInstructionSet.FUNCTION_CODE ||
        opcode === HVMInstructionSet.CALL_CODE
      ) {
        throw new ProgramException(`arg2 called on ${codeString}`);
      }
      return this.currentInstruction.getArg1();
    } else {
      throw new ProgramException('arg2 called on non-existent instruction');
    }
  }

  public hasSysInit(): boolean {
    return this.isSysInitFound;
  }

  /**
   * Resets the program (erases all commands).
   */
  public reset(): void {
    this.instructions = [];
    this.currentInstructionIndex = 0;
  }

  /**
   * Creates a vm program. If the given file is a dir, creates a program composed of the vm
   * files in the dir.
   * The vm files are scanned twice: in the first scan a symbol table (that maps
   * function & label names into addresses) is built. In the second scan, the instructions
   * array is built.
   * Throws ProgramException if an error occurs while loading the program.
   */
  public loadProgram(fileNames: string[]): void {
    const files: string[] = [];
    // class names are important for scoping static fields
    const classNames: string[] = [];
    for (let i = 0; i < fileNames.length; i++) {
      const content: string | null = localStorage.getItem(fileNames[i]);
      const className: string | undefined = fileNames[i];
      if (content === null) {
        throw new ProgramException('No content found in ' + fileNames[i]);
      }
      if (className === undefined) {
        throw new ProgramException('No class name found in ' + fileNames[i]);
      }
      classNames[i] = className;
      files[i] = content;
    }

    // Second scan
    for (let i = 0; i < classNames.length; i++) {
      const className: string = classNames[i];

      try {
        this.buildProgram(files[i], className);
      } catch (pe) {
        throw new ProgramException(name + ': ' + pe.message);
      }
    }
  }

  // Scans the given file and creates symbols for its functions & label names.
  private buildProgram(file: string, className: string): void {
    let lineNumber: number = 0;
    let label: string;
    let instructionName: string;
    let currentFunction: string = '';
    let opCode: number;
    let arg0: number;
    let arg1: number;
    let pc: number = this.currentInstructionIndex;

    this.isSlashStar = false;
    try {
      for (let line of file.split('\n')) {
        lineNumber++;
        if (line.indexOf('/') !== -1) {
          line = this.unCommentLine(line);
        }
        if (line.trim() !== '') {
          const tokenizer: StringTokenizer = new StringTokenizer(line);
          instructionName = tokenizer.nextToken();

          opCode = this.instructionSet.instructionStringToCode(instructionName);

          if (opCode === HVMInstructionSet.UNKNOWN_INSTRUCTION) {
            throw new ProgramException(
              'in line ' +
                lineNumber +
                ': unknown instruction - ' +
                instructionName,
            );
          }

          switch (opCode) {
            case HVMInstructionSet.PUSH_CODE:
              let segment: string = tokenizer.nextToken();
              try {
                arg0 = this.translateSegment(segment);
              } catch (pe) {
                throw new ProgramException(
                  'in line ' + lineNumber + pe.message,
                );
              }
              arg1 = parseInt(tokenizer.nextToken(), 10);
              if (arg1 < 0) {
                throw new ProgramException(
                  'in line ' + lineNumber + ': Illegal argument - ' + line,
                );
              }
              this.instructions[pc] = new HVMInstruction(opCode, arg0, arg1);
              this.instructions[pc].setStringArg(segment);
              if (arg0 === HVMInstructionSet.STATIC_SEGMENT_CODE) {
                this.instructions[pc].setStringArg(className);
              }
              break;

            case HVMInstructionSet.POP_CODE:
              const n: number = tokenizer.countTokens();
              segment = tokenizer.nextToken();
              try {
                arg0 = this.translateSegment(segment);
              } catch (pe) {
                throw new ProgramException(
                  'in line ' + lineNumber + pe.message,
                );
              }
              arg1 = parseInt(tokenizer.nextToken(), 10);

              if (arg1 < 0) {
                throw new ProgramException(
                  'in line ' + lineNumber + ': Illegal argument - ' + line,
                );
              }

              this.instructions[pc] = new HVMInstruction(opCode, arg0, arg1);
              this.instructions[pc].setStringArg(segment);
              if (arg0 === HVMInstructionSet.STATIC_SEGMENT_CODE) {
                this.instructions[pc].setStringArg(className);
              }
              break;

            case HVMInstructionSet.FUNCTION_CODE:
              currentFunction = tokenizer.nextToken();
              if (currentFunction === 'Sys.init') {
                this.isSysInitFound = true;
              }
              arg0 = parseInt(tokenizer.nextToken(), 10);

              if (arg0 < 0) {
                throw new ProgramException(
                  'in line ' + lineNumber + ': Illegal argument - ' + line,
                );
              }

              this.instructions[pc] = new HVMInstruction(opCode, arg0);
              this.instructions[pc].setStringArg(currentFunction);
              break;

            case HVMInstructionSet.CALL_CODE:
              const functionName: string = tokenizer.nextToken();

              arg1 = parseInt(tokenizer.nextToken(), 10);

              this.instructions[pc] = new HVMInstruction(opCode, -1, arg1);
              this.instructions[pc].setStringArg(functionName);
              break;

            case HVMInstructionSet.LABEL_CODE:
              label = tokenizer.nextToken();
              if (currentFunction !== '') {
                label = currentFunction + '$' + label;
              }
              this.instructions[pc] = new HVMInstruction(opCode);
              this.instructions[pc].setStringArg(label);
              break;

            case HVMInstructionSet.GOTO_CODE:
              label = tokenizer.nextToken();
              if (currentFunction !== '') {
                label = currentFunction + '$' + label;
              }
              this.instructions[pc] = new HVMInstruction(opCode);
              this.instructions[pc].setStringArg(label);
              break;

            case HVMInstructionSet.IF_GOTO_CODE:
              label = tokenizer.nextToken();
              if (currentFunction !== '') {
                label = currentFunction + '$' + label;
              }
              this.instructions[pc] = new HVMInstruction(opCode);
              this.instructions[pc].setStringArg(label);
              break;

            // All other instructions have either 1 or 0 arguments and require no
            // special treatment
            default:
              if (tokenizer.countTokens() === 0) {
                this.instructions[pc] = new HVMInstruction(opCode);
              } else {
                arg0 = parseInt(tokenizer.nextToken(), 10);

                if (arg0 < 0) {
                  throw new ProgramException(
                    'in line ' + lineNumber + ': Illegal argument - ' + line,
                  );
                }

                this.instructions[pc] = new HVMInstruction(opCode, arg0);
              }
              break;
          }

          // check end of command
          if (tokenizer.hasMoreTokens()) {
            throw new ProgramException(
              'in line ' + lineNumber + ': Too many arguments - ' + line,
            );
          }

          pc++;
        }

        this.currentInstructionIndex = pc;
      }
    } catch (e) {
      throw new ProgramException('In line ' + lineNumber + e.message);
    }
    if (this.isSlashStar) {
      throw new ProgramException('Unterminated /* comment at end of file');
    }
  }

  // Returns the "un-commented" version of the given line.
  // Comments can be either with // or /*.
  // The field isSlashStar holds the current /* comment state.
  private unCommentLine(line: string): string {
    let result: string = line;

    if (line !== null) {
      if (this.isSlashStar) {
        const posStarSlash: number = line.indexOf('*/');
        if (posStarSlash >= 0) {
          this.isSlashStar = false;
          result = this.unCommentLine(line.substring(posStarSlash + 2));
        } else {
          result = '';
        }
      } else {
        const posSlashSlash: number = line.indexOf('//');
        const posSlashStar: number = line.indexOf('/*');
        if (
          posSlashSlash >= 0 &&
          (posSlashStar < 0 || posSlashStar > posSlashSlash)
        ) {
          result = line.substring(0, posSlashSlash);
        } else if (posSlashStar >= 0) {
          this.isSlashStar = true;
          result =
            line.substring(0, posSlashStar) +
            this.unCommentLine(line.substring(posSlashStar + 2));
        }
      }
    }

    return result;
  }

  // Returns the numeric representation of the given string segment.
  // Throws an exception if unknown segment.
  private translateSegment(segment: string): number {
    const code: number = this.instructionSet.segmentVMStringToCode(segment);
    if (code === HVMInstructionSet.UNKNOWN_SEGMENT) {
      throw new ProgramException(': Illegal memory segment - ' + segment);
    }

    return code;
  }
}

export default VMParser;
