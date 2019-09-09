import Hashtable from '../Common/Hashtable';
import ActionEvent from './ActionEvent';
import HackTranslatorEvent from './HackTranslatorEvent';
import TextFileEvent from './TextFileEvent';
import Timer from './Timer';
import {
  ActionListener,
  HackTranslatorEventListener,
  HackTranslatorException,
  HackTranslatorGUI,
  Runnable,
  TextFileEventListener,
} from './types';

/**
 * This object provides translation services.
 */
abstract class HackTranslator
  implements
    HackTranslatorEventListener,
    ActionListener,
    TextFileEventListener {
  // The delay in ms between each step in fast forward
  private static readonly FAST_FORWARD_DELAY: number = 750;

  // Returns the version string, what the hell is Definitions.version
  private static getVersionString(): string {
    return ' (' + 'Definitions.version' + ')';
  }

  // the name of the source file
  protected sourceFileName: string = 'default.asm';

  // the name of the destination file
  protected destFileName: string = 'default.hack';

  // The size of the program.
  protected programSize: number = 0;

  // The program array
  protected program: number[] = [];

  // The source code array
  protected source: string[] = [];

  // The gui of the HackTranslator
  protected gui: HackTranslatorGUI | null = null;

  // True when compilation started already with singlestep or fastforward
  protected compilationStarted: boolean = false;

  // The index of the next location to compile into in the destination file.
  protected destPC: number = 0;

  // The index of the next location to compile in the source file.
  protected sourcePC: number = 0;

  // Maps between lines in the source files and their corresponding compiled lines
  // in the destination. The key is the pc of the source (Integer) and
  // the value is an int array of length 2, containing start and end pc of the destination
  // file.
  protected compilationMap: Hashtable = new Hashtable();

  // true only in the process of full compilation
  protected inFullCompilation: boolean = false;

  // true only in the process of Fast Forward
  protected inFastForward: boolean = false;

  // times the fast forward process
  private timer: Timer | null = null;

  // locked when single step in process
  private singleStepLocked: boolean = false;

  // If true, change to the translator will be displayed in its GUI.
  private updateGUI: boolean = false;

  /**
   * Constructs a new HackTranslator with the size of the program memory
   * and source file name. The given null value will be used to fill
   * the program initially. The compiled program can later be fetched
   * using the getProgram() method.
   * If save is true, the compiled program will be saved automatically into a destination
   * file that will have the same name as the source but with the destination extension.
   */
  constructor(
    fileName: string,
    size: number,
    nullValue: number,
    save: boolean,
  ) {
    if (fileName.indexOf('.') < 0) {
      fileName = fileName + '.' + this.getSourceExtension();
    }

    this.checkSourceFile(fileName);

    this.source = [];
    this.init(size, nullValue);

    this.loadSource(fileName);
    this.fullCompilation();

    if (save) {
      this.save();
    }
  }

  /**
   * Returns the translated machine code program array
   */
  public getProgram(): number[] {
    return this.program;
  }

  /**
   * Called when a line is selected in the source file.
   */
  public rowSelected(event: TextFileEvent): void {
    if (this.gui !== null) {
      const index: number = event.getRowIndex();
      const range: number[] = this.rowIndexToRange(index);
      this.gui.getSource().addHighlight(index, true);
      this.gui.getSource().hideSelect();
      if (range !== null) {
        this.gui.getDestination().clearHighlights();
        for (let i = range[0]; i <= range[1]; i++) {
          this.gui.getDestination().addHighlight(i, false);
        }
      } else {
        this.gui.getDestination().clearHighlights();
      }
    }
  }

  /**
   * Called by the timer in constant intervals (when in run mode).
   */
  public actionPerformed(e: ActionEvent): void {
    if (!this.singleStepLocked) {
      this.singleStep();
    }
  }

  public translatorActionPerformed(event: HackTranslatorEvent): void {
    let fileName: string;
    switch (event.getAction()) {
      case HackTranslatorEvent.SOURCE_LOAD:
        fileName = event.getData() as string;
        this.saveWorkingDir(fileName);
        if (this.gui !== null) {
          this.gui.setTitle(
            this.getName() +
              HackTranslator.getVersionString() +
              ' - ' +
              fileName,
          );
        }
        this.loadSourceTask(fileName);
        break;

      case HackTranslatorEvent.SAVE_DEST:
        this.clearMessage();
        fileName = event.getData() as string;
        try {
          this.checkDestinationFile(fileName);
          this.destFileName = fileName;
          this.saveWorkingDir(fileName);
          if (this.gui !== null) {
            this.gui.setTitle(
              this.getName() +
                HackTranslator.getVersionString() +
                ' - ' +
                fileName,
            );
          }
          this.save();
        } catch (ae) {
          if (this.gui !== null) {
            this.gui.setDestinationName('');
            this.gui.displayMessage(ae.message, true);
          }
        }
        break;

      case HackTranslatorEvent.SINGLE_STEP:
        this.clearMessage();
        if (this.sourceFileName === null && this.gui !== null) {
          this.gui.displayMessage('No source file specified', true);
        } else if (this.destFileName === null && this.gui !== null) {
          this.gui.displayMessage('No destination file specified', true);
        } else {
          this.singleStepTask();
        }
        break;

      case HackTranslatorEvent.FAST_FORWARD:
        this.clearMessage();
        this.fastForwardTask();
        break;

      case HackTranslatorEvent.STOP:
        this.stop();
        break;

      case HackTranslatorEvent.REWIND:
        this.clearMessage();
        this.rewind();
        break;

      case HackTranslatorEvent.FULL_COMPILATION:
        this.clearMessage();
        this.fullCompilationTask();
        break;
    }
  }

  // The full compilation task
  fullCompilationTask(): void {
    if (this.gui !== null) {
      this.gui.displayMessage('Please wait...', false);
    }

    try {
      this.restartCompilation();
      this.fullCompilation();
    } catch (ae) {
      this.end(false);
      if (this.gui !== null) {
        this.gui.getSource().addHighlight(this.sourcePC, true);
        this.gui.displayMessage(ae.message, true);
      }
    }
  }

  // The single step task, this was a runnable class in the
  // java implementation, but can't easily have threads in javascript
  singleStepTask(): void {
    if (!this.singleStepLocked) {
      this.singleStep();
    }
  }

  // The fast forward task
  fastForwardTask(): void {
    this.fastForward();
  }

  // The load source task
  loadSourceTask(fileName: string): void {
    try {
      this.loadSource(fileName);
    } catch (ae) {
      if (this.gui !== null) {
        this.gui.setSourceName('');
        this.gui.displayMessage(ae.message, true);
      }
    }
  }

  /**
   * Constructs a new HackTranslator with the size of the program memory.
   * The given null value will be used to fill the program initially.
   * A non null sourceFileName specifies a source file to be loaded.
   * The gui is assumed to be not null.
   */
  // constructor(
  //   gui: HackTranslatorGUI,
  //   size: number,
  //   nullValue: number,
  //   sourceFileName: string,
  // ) {
  //   this.gui = gui;
  //   this.gui.addHackTranslatorListener(this);
  //   this.gui.getSource().addTextFileListener(this);
  //   this.gui.setTitle(this.getName() + this.getVersionString());
  //   this.timer = new Timer(HackTranslator.FAST_FORWARD_DELAY, this);
  //   this.init(size, nullValue);

  //   let workingDir: string = this.loadWorkingDir();
  //   this.gui.setWorkingDir(workingDir);

  //   if (sourceFileName === undefined) {
  //     this.gui.disableSingleStep();
  //     this.gui.disableFastForward();
  //     this.gui.disableStop();
  //     this.gui.disableRewind();
  //     this.gui.disableFullCompilation();
  //     this.gui.disableSave();
  //     this.gui.enableLoadSource();
  //     this.gui.disableSourceRowSelection();
  //   } else {
  //     this.loadSource(sourceFileName);
  //     this.gui.setSourceName(sourceFileName);
  //   }
  // }

  /**
   * Returns the extension of the source file names.
   */
  protected abstract getSourceExtension(): string;

  /**
   * Returns the extension of the destination file names.
   */
  protected abstract getDestinationExtension(): string;

  /**
   * Returns the name of the translator.
   */
  protected abstract getName(): string;

  /*
   * Compiles the given line, adds the compiled code to the program and returns the
   * start and end program index of the new compiled code in a 2-element array.
   * If the line is a directive (doesn't compile to any physical code), returns null.
   * If the line is not legal, throws a HackTranslatorException.
   */
  protected compileLineAndCount(line: string): number[] {
    let result: number[] = [];

    const startPC: number = this.destPC;
    this.compileLine(line);
    const length = this.destPC - startPC;

    if (length > 0) {
      result = [startPC, this.destPC - 1];
    }

    return result;
  }

  /**
   * Compiles the given line and adds the compiled code to the program.
   * If the line is not legal, throws a HackTranslatorException.
   */
  protected abstract compileLine(line: string): void;

  /**
   * initializes the HackTranslator.
   */
  protected init(size: number, nullValue: number) {
    this.program = [];
    for (let i = 0; i < size; i++) {
      this.program[i] = nullValue;
    }
    this.programSize = 0;
  }

  /**
   * Restarts the compilation from the beginning of the source.
   */
  protected restartCompilation(): void {
    this.compilationMap = new Hashtable();
    this.sourcePC = 0;
    this.destPC = 0;

    if (this.gui !== null) {
      this.compilationStarted = false;
      this.gui.getDestination().reset();
      this.hidePointers();

      this.gui.enableSingleStep();
      this.gui.enableFastForward();
      this.gui.disableStop();
      this.gui.enableRewind();
      this.gui.enableFullCompilation();
      this.gui.disableSave();
      this.gui.enableLoadSource();
      this.gui.disableSourceRowSelection();
    }
  }

  /**
   * Initializes the source file.
   */
  protected abstract initSource(): void;

  /**
   * Resets the program
   */
  protected resetProgram(): void {
    this.programSize = 0;
    if (this.gui !== null) {
      this.gui.getDestination().reset();
    }
  }

  /**
   * Initializes the compilation process. Executed when a compilation is started.
   */
  protected abstract initCompilation(): void;

  /**
   * Finalizes the compilation process. Executed when a compilation is ended.
   */
  protected abstract finalizeCompilation(): void;

  /**
   * Executed when a compilation is successful.
   */
  protected successfulCompilation(): void {
    if (this.gui !== null) {
      this.gui.displayMessage('File compilation succeeded', false);
    }
  }

  /**
   * Returns the string version of the given code in the given program location.
   * If display is true, the version is for display purposes. Otherwise, the
   * version should be the final one.
   */
  protected abstract getCodeString(
    code: number,
    pc: number,
    display: boolean,
  ): string;

  /**
   * Adds the given command to the next position in the program.
   * Throws HackTranslatorException if the program is too large
   */
  protected addCommand(command: number): void {
    if (this.destPC >= this.program.length) {
      throw new HackTranslatorException('Program too large');
    }
    this.program[this.destPC++] = command;
    if (this.updateGUI && this.gui !== null) {
      this.gui
        .getDestination()
        .addLine(this.getCodeString(command, this.destPC - 1, true));
    }
  }

  /**
   * Replaces the command in program location pc with the given command.
   */
  protected replaceCommand(pc: number, command: number): void {
    this.program[pc] = command;
    if (this.updateGUI && this.gui !== null) {
      this.gui
        .getDestination()
        .setLineAt(pc, this.getCodeString(command, pc, true));
    }
  }

  /**
   * Displayes the first numOfCommands commands from the program in the dest window.
   */
  protected showProgram(numOfCommands: number): void {
    if (this.gui !== null) {
      this.gui.getDestination().reset();

      const lines = [];

      for (let i = 0; i < numOfCommands; i++) {
        lines[i] = this.getCodeString(this.program[i], i, true);
      }

      this.gui.getDestination().setContents(lines);
    }
  }

  /**
   * starts the fast forward mode.
   */
  protected fastForward(): void {
    if (this.gui !== null) {
      this.gui.disableSingleStep();
      this.gui.disableFastForward();
      this.gui.enableStop();
      this.gui.disableRewind();
      this.gui.disableFullCompilation();
      this.gui.disableLoadSource();
    }

    this.inFastForward = true;

    if (this.timer) {
      this.timer.start();
    }
  }

  /**
   * Hides all the pointers.
   */
  protected hidePointers(): void {
    if (this.gui !== null) {
      this.gui.getSource().clearHighlights();
      this.gui.getDestination().clearHighlights();
      this.gui.getSource().hideSelect();
      this.gui.getDestination().hideSelect();
    }
  }

  /**
   * Ends the compilers operation (only rewind or a new source can activate the compiler
   * after this), with an option to hide the pointers as well.
   */
  protected end(hidePointers: boolean): void {
    if (this.timer) {
      this.timer.stop();
    }
    if (this.gui !== null) {
      this.gui.disableSingleStep();
      this.gui.disableFastForward();
      this.gui.disableStop();
      this.gui.enableRewind();
      this.gui.disableFullCompilation();
      this.gui.enableLoadSource();
    }

    this.inFastForward = false;

    if (this.hidePointers) {
      this.hidePointers();
    }
  }

  /**
   * Stops the fast forward mode.
   */
  protected stop(): void {
    if (this.timer) {
      this.timer.stop();
    }
    if (this.gui !== null) {
      this.gui.enableSingleStep();
      this.gui.enableFastForward();
      this.gui.disableStop();
      this.gui.enableRewind();
      this.gui.enableLoadSource();
      this.gui.enableFullCompilation();
    }

    this.inFastForward = false;
  }

  /**
   * Rewinds to the beginning of the compilation.
   */
  protected rewind(): void {
    this.restartCompilation();
    this.resetProgram();
  }

  // Clears the message display.
  protected clearMessage(): void {
    if (this.gui !== null) {
      this.gui.displayMessage('', false);
    }
  }

  /**
   * Returns the range in the compilation map that corresponds to the given rowIndex.
   */
  protected rowIndexToRange(rowIndex: number): number[] {
    return this.compilationMap.get(rowIndex);
  }

  // Returns the working dir that is saved in the data file, or "" if data file doesn't exist.
  protected loadWorkingDir(): string {
    return 'bin/' + this.getName() + '.dat';
  }

  /**
   * Saves the given working dir into the data file.
   */
  protected saveWorkingDir(file: string): void {
    localStorage.setItem('bin/' + this.getName() + '.dat', file);
    if (this.gui !== null) {
      this.gui.setWorkingDir(file);
    }
  }

  /**
   * Throws a HackTranslatorException with the given message and the current line number.
   */
  protected error(message: string): void {
    throw new HackTranslatorException(`${message}, sourcePC: ${this.sourcePC}`);
  }

  // Checks the given source file name and throws a HackTranslatorException
  // if not legal.
  private checkSourceFile(fileName: string): void {
    if (!fileName.endsWith('.' + this.getSourceExtension())) {
      throw new HackTranslatorException(
        fileName + ' is not a .' + this.getSourceExtension() + ' file',
      );
    }

    const file: string | null = localStorage.getItem(fileName);
    if (file === null) {
      throw new HackTranslatorException('file ' + fileName + ' does not exist');
    }
  }

  // Checks the given destination file name and throws a HackTranslatorException
  // if not legal.
  private checkDestinationFile(fileName: string): void {
    if (!fileName.endsWith('.' + this.getDestinationExtension())) {
      throw new HackTranslatorException(
        fileName + ' is not a .' + this.getDestinationExtension() + ' file',
      );
    }
  }

  // Loads the given source file and displays it in the Source GUI
  private loadSource(fileName: string): void {
    let formattedLines: string[] = [];
    let lines: string[] = [];
    let errorMessage: string | null = null;

    try {
      if (this.gui !== null) {
        this.gui.disableSingleStep();
        this.gui.disableFastForward();
        this.gui.disableStop();
        this.gui.disableRewind();
        this.gui.disableFullCompilation();
        this.gui.disableSave();
        this.gui.disableLoadSource();
        this.gui.disableSourceRowSelection();

        this.gui.displayMessage('Please wait...', false);
      }
      this.checkSourceFile(fileName);
      this.sourceFileName = fileName;

      const sourceReader: string | null = localStorage.getItem(fileName);
      if (sourceReader === null) {
        throw new HackTranslatorException(
          `File name: ${fileName} does not exist`,
        );
      }
      formattedLines = sourceReader.split('\n');
      if (this.gui !== null) {
        lines = sourceReader.split('\n');
      }

      this.source = formattedLines;

      if (this.gui !== null) {
        this.gui.getSource().setContents(lines);
      }

      this.destFileName =
        this.sourceFileName.substring(0, this.sourceFileName.indexOf('.')) +
        '.' +
        this.getDestinationExtension();
      this.initSource();

      this.restartCompilation();

      this.resetProgram();

      if (this.gui !== null) {
        this.gui.setDestinationName(this.destFileName);
        this.gui.displayMessage('', false);
      }
    } catch (hte) {
      errorMessage =
        hte.message || `error reading from file ${this.sourceFileName}`;
    }

    if (errorMessage !== null) {
      if (this.gui !== null) {
        this.gui.enableLoadSource();
      }

      throw new HackTranslatorException(errorMessage);
    }
  }

  // Translates the whole source. Assumes a legal sourceReader & writer.
  private fullCompilation(): void {
    try {
      this.inFullCompilation = true;
      this.initCompilation();
      if (this.gui !== null) {
        this.gui.disableSingleStep();
        this.gui.disableFastForward();
        this.gui.disableRewind();
        this.gui.disableFullCompilation();
        this.gui.disableLoadSource();

        this.gui.getSource().setContents(this.sourceFileName);
      }

      this.updateGUI = false;
      while (this.sourcePC < this.source.length) {
        const compiledRange: number[] = this.compileLineAndCount(
          this.source[this.sourcePC],
        );
        if (compiledRange !== null) {
          this.compilationMap.put(this.sourcePC, compiledRange);
        }

        this.sourcePC++;
      }
      this.successfulCompilation();
      this.finalizeCompilation();

      this.programSize = this.destPC;

      if (this.gui !== null) {
        this.showProgram(this.programSize);
        this.gui.getDestination().clearHighlights();
        this.gui.enableRewind();
        this.gui.enableLoadSource();
        this.gui.enableSave();
        this.gui.enableSourceRowSelection();
      }

      this.inFullCompilation = false;
    } catch (hte) {
      this.inFullCompilation = false;
      throw new HackTranslatorException(hte.message);
    }
  }

  // Reads a single line from the source, compiles it and writes the result to the
  // detination.
  private singleStep(): void {
    this.singleStepLocked = true;

    try {
      this.initCompilation();

      if (!this.compilationStarted) {
        this.compilationStarted = true;
      }
      if (this.gui !== null) {
        this.gui.getSource().addHighlight(this.sourcePC, true);
        this.gui.getDestination().clearHighlights();
        this.updateGUI = true;
      }

      const compiledRange: number[] = this.compileLineAndCount(
        this.source[this.sourcePC],
      );

      if (compiledRange !== null) {
        this.compilationMap.put(this.sourcePC, compiledRange);
      }

      this.sourcePC++;

      if (this.sourcePC === this.source.length) {
        this.successfulCompilation();
        this.programSize = this.destPC;
        if (this.gui !== null) {
          this.gui.enableSave();
          this.gui.enableSourceRowSelection();
        }
        this.end(false);
      }

      this.finalizeCompilation();
    } catch (ae) {
      if (this.gui !== null) {
        this.gui.displayMessage(ae.message, true);
      }
      this.end(false);
    }

    this.singleStepLocked = false;
  }

  // Saves the program into the given dest file name.
  private save(): void {
    try {
      this.dumpToFile(this.destFileName);
    } catch {
      throw new HackTranslatorException(
        'could not create file ' + this.destFileName,
      );
    }
  }

  /**
   * Dumps the contents of the translated program into the destination file
   */
  private dumpToFile(destFileName: string): void {
    let content: string = '';
    for (let i = 0; i < this.programSize; i++) {
      content += '\n' + this.getCodeString(this.program[i], i, false);
    }
    localStorage.setItem(destFileName, content);
  }
}

export default HackTranslator;
