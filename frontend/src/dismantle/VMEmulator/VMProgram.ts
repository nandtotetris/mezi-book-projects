import Hashtable from '../Common/Hashtable';
import Vector from '../Common/Vector';
import ComputerPartGUI from '../ComputerParts/ComputerPartGUI';
import InteractiveComputerPart from '../ComputerParts/InteractiveComputerPart';
import ProgramException from '../Controller/ProgramException';
import ProgramEvent from '../Events/ProgramEvent';
import ProgramEventListener from '../Events/ProgramEventListener';
import Definitions from '../Utilities/Definitions';
import HVMInstructionSet from '../VirtualMachine/HVMInstructionSet';
import StringTokenizer from './SimpleStringTokenizer';
import VMEmulatorInstruction from './VMEmulatorInstruction';
import VMProgramGUI from './VMProgramGUI';
/**
 * A list of VM instructions, with a program counter.
 */
class VMProgram extends InteractiveComputerPart
  implements ProgramEventListener {
  // pseudo address for returning to built-in functions
  public static readonly BUILTIN_FUNCTION_ADDRESS: number = -1;

  // Possible values for the current status - has the user allowed
  // access to built-in vm functions?
  private static readonly BUILTIN_ACCESS_UNDECIDED: number = 0;
  private static readonly BUILTIN_ACCESS_AUTHORIZED: number = 1;
  private static readonly BUILTIN_ACCESS_DENIED: number = 2;

  // listeners to program changes
  private listeners: Vector;

  // The list of VM instructions
  private instructions: VMEmulatorInstruction[] = [];
  private instructionsLength: number = 0;
  private visibleInstructionsLength: number = 0;

  // The program counter - points to the next instruction that should be executed.
  private nextPC: number = 0;
  private currentPC: number = 0;
  private prevPC: number = 0;

  // The gui of the program.
  private gui: VMProgramGUI;

  // The address of the initial instruction
  private startAddress: number = 0;

  // Mapping from file names to an array of two elements, containing the start and
  // end addresses of the corresponding static segment.
  private staticRange: Hashtable;

  // Addresses of functions by name
  private functions: Hashtable;
  private infiniteLoopForBuiltInsAddress: number = 0;

  // The current index of the static variables
  private currentStaticIndex: number = 0;

  // The largest static variable index found in the current file.
  private largestStaticIndex: number = 0;

  // Has the user allowed access to built-in vm functions?
  private builtInAccessStatus: number = 0;

  // Is the program currently being read in the middle of a /* */ comment?
  private isSlashStar: boolean = false;

  /**
   * Constructs a new empty program with the given GUI.
   */
  public constructor(gui: VMProgramGUI) {
    super(gui !== null);
    this.gui = gui;
    this.listeners = new Vector();
    this.staticRange = new Hashtable();
    this.functions = new Hashtable();

    if (this.hasGUI) {
      gui.addProgramListener(this);
      gui.addErrorListener(this);
    }

    this.reset();
  }

  /**
   * Returns the static variable address range of the given class name, in the
   * form of a 2-elements array {startAddress, endAddress}.
   * If unknown class name, returns null.
   */
  public getStaticRange(className: string): number[] {
    return this.staticRange.get(className) as number[];
  }

  /**
   * Returns the size of the program.
   */
  public getSize(): number {
    return this.instructionsLength;
  }

  public getAddress(functionName: string): number {
    const address: number = this.functions.get(functionName);
    if (address !== undefined) {
      return address;
    } else {
      const className: string = functionName.substring(
        0,
        functionName.indexOf('.'),
      );
      if (this.staticRange.get(className) == null) {
        // The class is not implemented by a VM file - search for a
        // built-in implementation later. Display a popup to confirm
        // this as this is not a feature from the book but a later
        // addition.
        if (this.builtInAccessStatus === VMProgram.BUILTIN_ACCESS_UNDECIDED) {
          if (this.hasGUI && this.gui.confirmBuiltInAccess()) {
            this.builtInAccessStatus = VMProgram.BUILTIN_ACCESS_AUTHORIZED;
          } else {
            this.builtInAccessStatus = VMProgram.BUILTIN_ACCESS_DENIED;
          }
        }
        if (this.builtInAccessStatus === VMProgram.BUILTIN_ACCESS_AUTHORIZED) {
          return VMProgram.BUILTIN_FUNCTION_ADDRESS;
        }
      }
      // Either:
      // 1.The class is implemented by a VM file and no implementation
      //     for the function is found - don't override with built-in
      // - or -
      // 2.The user did not authorize using built-in implementations.
      throw new ProgramException(
        className +
          '.vm not found ' +
          'or function ' +
          functionName +
          ' not found in ' +
          className +
          '.vm',
      );
    }
  }

  /**
   * Returns the next program counter.
   */
  public getPC(): number {
    return this.nextPC;
  }

  /**
   * Returns the current value of the program counter.
   */
  public getCurrentPC(): number {
    return this.currentPC;
  }

  /**
   * Returns the previous value of the program counter.
   */
  public getPreviousPC(): number {
    return this.prevPC;
  }

  /**
   * Sets the program counter with the given address.
   */
  public setPC(address: number): void {
    this.prevPC = this.currentPC;
    this.currentPC = this.nextPC;
    this.nextPC = address;
    this.setGUIPC();
  }

  /**
   * Sets the program counter to a specially created infinite loop in the
   * end of the programs for access by built-in functions, de-facto halting
   * the program.
   * important so that tests and other scripts finish counting
   * (since a built-in infinite loop doesn't count as steps).
   * also needed because there is no good way to use the stop button to
   * stop an infinite loop in a built-in jack class.
   * A message containing information may be provided (can be null).
   */
  public setPCToInfiniteLoopForBuiltIns(message: string): void {
    if (this.hasGUI) {
      this.gui.notify(message);
    }
    this.setPC(this.infiniteLoopForBuiltInsAddress);
  }

  /**
   * Returns the next VMEmulatorInstruction and increments the PC by one.
   * The PC will be incremented by more if the next instruction is a label.
   */
  public getNextInstruction(): VMEmulatorInstruction | null {
    let result: VMEmulatorInstruction | null = null;

    if (this.nextPC < this.instructionsLength) {
      result = this.instructions[this.nextPC];
      this.prevPC = this.currentPC;
      this.currentPC = this.nextPC;

      do {
        this.nextPC++;
      } while (
        this.nextPC < this.instructionsLength &&
        this.instructions[this.nextPC].getOpCode() ===
          HVMInstructionSet.LABEL_CODE
      );

      this.setGUIPC();
    }

    return result;
  }

  /**
   * Restarts the program from the beginning.
   */
  public restartProgram(): void {
    this.currentPC = -999;
    this.prevPC = -999;
    this.nextPC = this.startAddress;
    this.setGUIPC();
  }

  /**
   * Resets the program (erases all commands).
   */
  public reset(): void {
    this.instructions = [];
    this.visibleInstructionsLength = this.instructionsLength = 0;
    this.currentPC = -999;
    this.prevPC = -999;
    this.nextPC = -1;
    this.setGUIContents();
  }

  /**
   * Returns the GUI of the computer part.
   */
  public getGUI(): ComputerPartGUI {
    return this.gui;
  }

  /**
   * Called when the current program file/directory is changed.
   * The event contains the source object, the event type and the program's file/dir (if any).
   */
  public programChanged(event: ProgramEvent): void {
    switch (event.getType()) {
      case ProgramEvent.LOAD:
        this.loadProgramTask(event.getProgramFileNames());
        break;
      case ProgramEvent.CLEAR:
        this.reset();
        this.notifyProgramListeners(ProgramEvent.CLEAR, []);
        break;
    }
  }

  // The task that loads a new program into the emulator
  public loadProgramTask(fileNames: string[]): void {
    this.clearErrorListeners();
    try {
      this.loadProgram(fileNames);
    } catch (pe) {
      this.notifyErrorListeners(pe.message);
    }
  }

  public refreshGUI(): void {
    if (this.displayChanges) {
      this.gui.setContents(this.instructions, this.visibleInstructionsLength);
      this.gui.setCurrentInstruction(this.nextPC);
    }
  }

  /**
   * Registers the given ProgramEventListener as a listener to this GUI.
   */
  public addProgramListener(listener: ProgramEventListener): void {
    this.listeners.add(listener);
  }

  /**
   * Un-registers the given ProgramEventListener from being a listener to this GUI.
   */
  public removeProgramListener(listener: ProgramEventListener): void {
    this.listeners.remove(listener);
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
      let rawFileObj: any | null = localStorage.getItem(fileNames[i]);
      if (rawFileObj !== null) {
        rawFileObj = JSON.parse(rawFileObj);
        const content: string | undefined = rawFileObj.content;
        const className: string | undefined = rawFileObj.name;
        if (content === undefined) {
          throw new ProgramException('No content found in ' + fileNames[i]);
        }
        if (className === undefined) {
          throw new ProgramException('No class name found in ' + fileNames[i]);
        }
        classNames[i] = className;
        files[i] = content;
      }
    }

    if (this.displayChanges) {
      this.gui.showMessage('Loading...');
    }

    // First scan
    this.staticRange.clear();
    this.functions.clear();
    this.builtInAccessStatus = VMProgram.BUILTIN_ACCESS_UNDECIDED;
    const symbols: Hashtable = new Hashtable();
    this.nextPC = 0;
    for (let i = 0; i < classNames.length; i++) {
      const className: string = classNames[i];
      // put some dummy into static range - just to tell the function
      // getAddress in the second pass which classes exist
      this.staticRange.put(className, true);
      try {
        this.updateSymbolTable(files[i], symbols, this.functions);
      } catch (pe) {
        if (this.displayChanges) {
          this.gui.hideMessage();
        }
        throw new ProgramException(name + ': ' + pe.message);
      }
    }
    let addCallBuiltInSysInit: boolean = false;
    if (
      (files.length > 1 || symbols.get('Main.main') !== undefined) &&
      symbols.get('Sys.init') === undefined
    ) {
      // If the program is in multiple files or there's a Main.main
      // function it is assumed that it should be run by calling Sys.init.
      // If no Sys.init is found, add an invisible line with a call
      // to Sys.init to start on - the builtin version will be called.
      addCallBuiltInSysInit = true;
      this.getAddress('Sys.init'); // confirm calling the built-in Sys.init
      ++this.nextPC; // A "call Sys.init 0" line will be added
    }

    this.instructions = [];

    // Second scan
    this.nextPC = 0;
    this.currentStaticIndex = Definitions.VAR_START_ADDRESS;
    for (let i = 0; i < classNames.length; i++) {
      const className: string = classNames[i];

      this.largestStaticIndex = -1;
      const range: number[] = [];
      range[0] = this.currentStaticIndex;

      try {
        // functions is not passed as an argument since it is accessed
        // through getAddress()
        this.buildProgram(files[i], symbols, className);
      } catch (pe) {
        if (this.displayChanges) {
          this.gui.hideMessage();
        }
        throw new ProgramException(name + ': ' + pe.message);
      }

      this.currentStaticIndex += this.largestStaticIndex + 1;
      range[1] = this.currentStaticIndex - 1;
      this.staticRange.put(className, range);
    }
    this.instructionsLength = this.visibleInstructionsLength = this.nextPC;
    if (this.builtInAccessStatus === VMProgram.BUILTIN_ACCESS_AUTHORIZED) {
      // Add some "invisible" code in the end to make everything work
      this.instructionsLength += 4;
      if (addCallBuiltInSysInit) {
        this.instructionsLength += 1;
      }
      let indexInInvisibleCode: number = 0;
      // Add a jump to the end (noone should get here since
      // both calls to built-in functions indicate that
      // that this is a function-based program and not a script
      // a-la proj7, but just to be on the safe side...).
      this.instructions[this.nextPC] = new VMEmulatorInstruction(
        HVMInstructionSet.GOTO_CODE,
        this.instructionsLength,
        indexInInvisibleCode,
      );
      this.instructions[this.nextPC].setStringArg('afterInvisibleCode');
      this.nextPC++;
      // Add a small infinite loop for built-in
      // methods to call (for example when Sys.halt is
      // called it must call a non-built-in infinite loop
      // because otherwise the current script would not
      // finish running - a problem for the OS tests.
      this.instructions[this.nextPC] = new VMEmulatorInstruction(
        HVMInstructionSet.LABEL_CODE,
        -1,
      );
      this.instructions[this.nextPC].setStringArg('infiniteLoopForBuiltIns');
      this.nextPC++;
      this.infiniteLoopForBuiltInsAddress = this.nextPC;
      this.instructions[this.nextPC] = new VMEmulatorInstruction(
        HVMInstructionSet.GOTO_CODE,
        this.nextPC,
        ++indexInInvisibleCode,
      );
      this.instructions[this.nextPC].setStringArg('infiniteLoopForBuiltIns');
      this.nextPC++;
      if (addCallBuiltInSysInit) {
        // Add a call to the built-in Sys.init
        this.instructions[this.nextPC] = new VMEmulatorInstruction(
          HVMInstructionSet.CALL_CODE,
          this.getAddress('Sys.init'),
          0,
          ++indexInInvisibleCode,
        );
        this.instructions[this.nextPC].setStringArg('Sys.init');
        this.startAddress = this.nextPC;
        this.nextPC++;
      }
      // Add the label that the first invisible code line jumps to
      this.instructions[this.nextPC] = new VMEmulatorInstruction(
        HVMInstructionSet.LABEL_CODE,
        -1,
      );
      this.instructions[this.nextPC].setStringArg('afterInvisibleCode');
      this.nextPC++;
    }

    if (!addCallBuiltInSysInit) {
      const sysInitAddress: number = symbols.get('Sys.init');
      if (sysInitAddress === undefined) {
        this.startAddress = 0;
      } // Single file, no Sys.init - start at 0
      else {
        this.startAddress = sysInitAddress;
      } // Implemented Sys.init - start there
    }

    if (this.displayChanges) {
      this.gui.hideMessage();
    }

    this.nextPC = this.startAddress;
    this.setGUIContents();

    this.notifyProgramListeners(ProgramEvent.LOAD, fileNames);
  }

  /***
   * Notifies all the ProgramEventListeners on a change in the VM's program by creating
   * a ProgramEvent (with the new event type and program's file name) and sending it using the
   * programChanged function to all the listeners.
   */
  protected notifyProgramListeners(
    eventType: number,
    programFileNames: string[],
  ): void {
    const event: ProgramEvent = new ProgramEvent(
      this,
      eventType,
      programFileNames,
    );

    for (let i = 0; i < this.listeners.size(); i++) {
      (this.listeners.elementAt(i) as ProgramEventListener).programChanged(
        event,
      );
    }
  }

  // Scans the given file and creates symbols for its functions & label names.
  private updateSymbolTable(
    file: string,
    symbols: Hashtable,
    functions: Hashtable,
  ) {
    const lines: string[] = file.split('\n');

    let currentFunction: string | null = null;
    let label: string;
    let lineNumber: number = 0;

    // this.isSlashStar = false;
    try {
      for (const line of lines) {
        lineNumber++;
        if (line.trim() !== '') {
          if (line.startsWith('function ')) {
            const tokenizer: StringTokenizer = new StringTokenizer(line);
            tokenizer.nextToken();
            currentFunction = tokenizer.nextToken();
            if (symbols.containsKey(currentFunction)) {
              throw new ProgramException(
                'subroutine ' + currentFunction + ' already exists',
              );
            }
            functions.put(currentFunction, this.nextPC);
            symbols.put(currentFunction, this.nextPC);
          } else if (line.startsWith('label ')) {
            const tokenizer: StringTokenizer = new StringTokenizer(line);
            tokenizer.nextToken();
            label = currentFunction + '$' + tokenizer.nextToken();
            symbols.put(label, this.nextPC + 1);
          }
          this.nextPC++;
        }
      }
    } catch (e) {
      throw new ProgramException('In line ' + lineNumber + e.message);
    }
    // if (this.isSlashStar) {
    //   throw new ProgramException('Unterminated /* comment at end of file');
    // }
  }

  // Scans the given file and creates symbols for its functions & label names.
  private buildProgram(
    file: string,
    symbols: Hashtable,
    className: string,
  ): void {
    let lineNumber: number = 0;
    let label: string;
    let instructionName: string;
    let currentFunction: string | null = null;
    let indexInFunction: number = 0;
    let opCode: number;
    let arg0: number;
    let arg1: number;
    let pc: number = this.nextPC;
    const instructionSet: HVMInstructionSet = HVMInstructionSet.getInstance();

    this.isSlashStar = false;
    try {
      for (const line of file.split('\n')) {
        lineNumber++;

        if (line.trim() !== '') {
          const tokenizer: StringTokenizer = new StringTokenizer(line);
          instructionName = tokenizer.nextToken();

          opCode = instructionSet.instructionStringToCode(instructionName);
          if (opCode !== HVMInstructionSet.UNKNOWN_INSTRUCTION) {
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
                arg0 = this.translateSegment(
                  segment,
                  instructionSet,
                  className,
                );
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

              if (
                arg0 === HVMInstructionSet.STATIC_SEGMENT_CODE &&
                arg1 > this.largestStaticIndex
              ) {
                this.largestStaticIndex = arg1;
              }
              this.instructions[pc] = new VMEmulatorInstruction(
                opCode,
                arg0,
                arg1,
                indexInFunction,
              );
              break;

            case HVMInstructionSet.POP_CODE:
              const n: number = tokenizer.countTokens();
              segment = tokenizer.nextToken();
              try {
                arg0 = this.translateSegment(
                  segment,
                  instructionSet,
                  className,
                );
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

              if (
                arg0 === HVMInstructionSet.STATIC_SEGMENT_CODE &&
                arg1 > this.largestStaticIndex
              ) {
                this.largestStaticIndex = arg1;
              }

              this.instructions[pc] = new VMEmulatorInstruction(
                opCode,
                arg0,
                arg1,
                indexInFunction,
              );
              break;

            case HVMInstructionSet.FUNCTION_CODE:
              currentFunction = tokenizer.nextToken();
              indexInFunction = 0;
              arg0 = parseInt(tokenizer.nextToken(), 10);

              if (arg0 < 0) {
                throw new ProgramException(
                  'in line ' + lineNumber + ': Illegal argument - ' + line,
                );
              }

              this.instructions[pc] = new VMEmulatorInstruction(
                opCode,
                arg0,
                indexInFunction,
              );
              this.instructions[pc].setStringArg(currentFunction);
              break;

            case HVMInstructionSet.CALL_CODE:
              const functionName: string = tokenizer.nextToken();
              try {
                arg0 = this.getAddress(functionName);
              } catch (pe) {
                throw new ProgramException(
                  'in line ' + lineNumber + ': ' + pe.message,
                );
              }
              arg1 = parseInt(tokenizer.nextToken(), 10);

              if (
                arg1 < 0 ||
                ((arg0 < 0 || arg0 > Definitions.ROM_SIZE) &&
                  arg0 !== VMProgram.BUILTIN_FUNCTION_ADDRESS)
              ) {
                throw new ProgramException(
                  'in line ' + lineNumber + ': Illegal argument - ' + line,
                );
              }

              this.instructions[pc] = new VMEmulatorInstruction(
                opCode,
                arg0,
                arg1,
                indexInFunction,
              );
              this.instructions[pc].setStringArg(functionName);
              break;

            case HVMInstructionSet.LABEL_CODE:
              label = currentFunction + '$' + tokenizer.nextToken();
              this.instructions[pc] = new VMEmulatorInstruction(opCode, -1);
              this.instructions[pc].setStringArg(label);
              indexInFunction--; // since Label is not a "physical" instruction
              break;

            case HVMInstructionSet.GOTO_CODE:
              label = currentFunction + '$' + tokenizer.nextToken();
              let labelAddress: number = symbols.get(label);
              if (labelAddress === undefined) {
                throw new ProgramException(
                  'in line ' + lineNumber + ': Unknown label - ' + label,
                );
              }
              arg0 = labelAddress;

              if (arg0 < 0 || arg0 > Definitions.ROM_SIZE) {
                throw new ProgramException(
                  'in line ' + lineNumber + ': Illegal argument - ' + line,
                );
              }
              this.instructions[pc] = new VMEmulatorInstruction(
                opCode,
                arg0,
                indexInFunction,
              );
              this.instructions[pc].setStringArg(label);
              break;

            case HVMInstructionSet.IF_GOTO_CODE:
              label = currentFunction + '$' + tokenizer.nextToken();
              labelAddress = symbols.get(label);
              if (labelAddress === undefined) {
                throw new ProgramException(
                  'in line ' + lineNumber + ': Unknown label - ' + label,
                );
              }

              arg0 = labelAddress;

              if (arg0 < 0 || arg0 > Definitions.ROM_SIZE) {
                throw new ProgramException(
                  'in line ' + lineNumber + ': Illegal argument - ' + line,
                );
              }

              this.instructions[pc] = new VMEmulatorInstruction(
                opCode,
                arg0,
                indexInFunction,
              );
              this.instructions[pc].setStringArg(label);
              break;

            // All other instructions have either 1 or 0 arguments and require no
            // special treatment
            default:
              if (tokenizer.countTokens() === 0) {
                this.instructions[pc] = new VMEmulatorInstruction(
                  opCode,
                  indexInFunction,
                );
              } else {
                arg0 = parseInt(tokenizer.nextToken(), 10);

                if (arg0 < 0) {
                  throw new ProgramException(
                    'in line ' + lineNumber + ': Illegal argument - ' + line,
                  );
                }

                this.instructions[pc] = new VMEmulatorInstruction(
                  opCode,
                  arg0,
                  indexInFunction,
                );
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
          indexInFunction++;
        }

        this.nextPC = pc;
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
  private translateSegment(
    segment: string,
    instructionSet: HVMInstructionSet,
    fileName: string,
  ): number {
    const code: number = instructionSet.segmentVMStringToCode(segment);
    if (code === HVMInstructionSet.UNKNOWN_SEGMENT) {
      throw new ProgramException(': Illegal memory segment - ' + segment);
    }

    return code;
  }

  // Sets the gui's contents (if a gui exists)
  private setGUIContents(): void {
    if (this.displayChanges) {
      this.gui.setContents(this.instructions, this.visibleInstructionsLength);
      this.gui.setCurrentInstruction(this.nextPC);
    }
  }

  // Sets the GUI's current instruction index
  private setGUIPC(): void {
    if (this.displayChanges) {
      this.gui.setCurrentInstruction(this.nextPC);
    }
  }
}

export default VMProgram;
