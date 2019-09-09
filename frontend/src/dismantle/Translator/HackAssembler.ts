import Hashtable from '../Common/Hashtable';
import Conversions from '../Utilities/Conversions';
import Definitions from '../Utilities/Definitions';
import AssemblyLineTokenizer from './AssemblyLineTokenizer';
import HackAssemblerEvent from './HackAssemblerEvent';
// tslint:disable-next-line: no-circular-imports
import HackAssemblerTranslator from './HackAssemblerTranslator';
import HackTranslator from './HackTranslator';
import HackTranslatorEvent from './HackTranslatorEvent';
import TextFileEvent from './TextFileEvent';
import {
  AssemblerException,
  HackAssemblerGUI,
  HackTranslatorException,
  TextFileGUI,
} from './types';

/**
 * A translator from assmebly (.asm) to hack machine language (.hack)
 */
class HackAssembler extends HackTranslator {
  // the reader of the comparison file
  private comparisonReader: string | null = null;

  // the name of the comparison .hack file
  private comparisonFileName: string | null = null;

  // the symbol table
  private symbolTable: Hashtable = new Hashtable();

  // The comarison program array
  private comparisonProgram: number[] = [];

  // The HackAssembler translator;
  private translator: HackAssemblerTranslator = HackAssemblerTranslator.getInstance();

  // Index of the next location for unrecognized labels
  private varIndex: number = 0;

  /**
   * Constructs a new HackAssembler with the size of the program memory
   * and .asm source file name. The given null value will be used to fill
   * the program initially. The compiled program can later be fetched
   * using the getProgram() method.
   * If save is true, the compiled program will be saved automatically into a ".hack"
   * file that will have the same name as the source but with the .hack extension.
   */
  constructor(
    fileName: string,
    size: number,
    nullValue: number,
    save: boolean,
  ) {
    super(fileName, size, nullValue, save);
  }

  public rowSelected(event: TextFileEvent) {
    super.rowSelected(event);

    const range: number[] = this.rowIndexToRange(event.getRowIndex());
    if (!range) {
      if (this.comparisonReader !== null) {
        (this.gui as HackAssemblerGUI)
          .getComparison()
          .select(range[0], range[1]);
      }
    } else {
      if (this.comparisonReader !== null) {
        (this.gui as HackAssemblerGUI).getComparison().hideSelect();
      }
    }
  }

  public translatorActionPerformed(event: HackTranslatorEvent) {
    super.translatorActionPerformed(event);

    switch (event.getAction()) {
      case HackTranslatorEvent.SOURCE_LOAD:
        this.comparisonFileName = null;
        this.comparisonReader = null;
        if (this.gui !== null) {
          (this.gui as HackAssemblerGUI).setComparisonName('');
          (this.gui as HackAssemblerGUI).hideComparison();
        }

        break;

      case HackAssemblerEvent.COMPARISON_LOAD:
        this.clearMessage();
        const fileName: string = event.getData() as string;
        try {
          this.checkComparisonFile(fileName);
          this.comparisonFileName = fileName;
          this.saveWorkingDir(fileName);
          this.resetComparisonFile();
          if (this.gui !== null) {
            (this.gui as HackAssemblerGUI).showComparison();
          }
        } catch (ae) {
          if (this.gui !== null) {
            this.gui.displayMessage(ae.message, true);
          }
        }
        break;
    }
  }

  /**
   * Constructs a new HackAssembler with the size of the program memory.
   * The given null value will be used to fill the program initially.
   * A non null sourceFileName specifies a source file to be loaded.
   * The gui is assumed to be not null.
   */
  // constructor(
  //   gui: HackAssemblerGUI,
  //   size: number,
  //   nullValue: number,
  //   sourceFileName: string,
  // ) {
  //   super(gui, size, nullValue, sourceFileName);

  //   this.gui.enableLoadComparison();
  //   (this.gui as HackAssemblerGUI).hideComparison();
  // }

  protected getSourceExtension(): string {
    return 'asm';
  }

  protected getDestinationExtension(): string {
    return 'hack';
  }

  protected getName(): string {
    return 'Assembler';
  }

  protected init(size: number, nullValue: number) {
    super.init(size, nullValue);
    this.translator = HackAssemblerTranslator.getInstance();
  }

  protected restartCompilation() {
    super.restartCompilation();

    this.varIndex = Definitions.VAR_START_ADDRESS;

    if (this.gui !== null) {
      (this.gui as HackAssemblerGUI).enableLoadComparison();
    }
  }

  protected initSource() {
    this.generateSymbolTable();
  }

  protected initCompilation() {
    if (
      this.gui !== null &&
      (this.inFullCompilation || !this.compilationStarted)
    ) {
      (this.gui as HackAssemblerGUI).disableLoadComparison();
    }
  }

  protected successfulCompilation() {
    if (this.comparisonReader === null) {
      super.successfulCompilation();
    } else {
      if (this.gui !== null) {
        this.gui.displayMessage(
          'File compilation & comparison succeeded',
          false,
        );
      }
    }
  }

  protected compileLineAndCount(line: string): number[] {
    const compiledRange: number[] = super.compileLineAndCount(line);
    // check comparison
    if (compiledRange !== null && this.comparisonReader) {
      const length: number = compiledRange[1] - compiledRange[0] + 1;
      const compare: boolean = this.compare(compiledRange);

      if (this.inFullCompilation) {
        if (!compare) {
          if (this.gui !== null) {
            this.programSize = this.destPC + length - 1;
            this.showProgram(this.programSize);
            this.gui.getSource().addHighlight(this.sourcePC, true);
            this.gui.getDestination().addHighlight(this.destPC - 1, true);
            (this.gui as HackAssemblerGUI)
              .getComparison()
              .addHighlight(this.destPC - 1, true);
            this.gui.enableRewind();
            this.gui.enableLoadSource();
          }
        }
      } else {
        if (this.gui !== null) {
          if (compare) {
            (this.gui as HackAssemblerGUI)
              .getComparison()
              .addHighlight(this.destPC + length - 2, true);
          } else {
            this.gui.getDestination().addHighlight(this.destPC - 1, true);
            (this.gui as HackAssemblerGUI)
              .getComparison()
              .addHighlight(this.destPC - 1, true);
          }
        }
      }

      if (!compare) {
        throw new HackTranslatorException('Comparison failure');
      }
    }

    return compiledRange;
  }

  protected getCodeString(code: number, pc: number, display: boolean): string {
    return Conversions.decimalToBinary(code, 16);
  }

  protected fastForward() {
    (this.gui as HackAssemblerGUI).disableLoadComparison();
    super.fastForward();
  }

  protected hidePointers() {
    super.hidePointers();

    if (this.comparisonReader !== null) {
      (this.gui as HackAssemblerGUI).getComparison().clearHighlights();
    }
  }

  protected end(hidePointers: boolean) {
    super.end(hidePointers);
    (this.gui as HackAssemblerGUI).disableLoadComparison();
  }

  protected stop() {
    super.stop();
    (this.gui as HackAssemblerGUI).disableLoadComparison();
  }

  protected rewind() {
    super.rewind();

    if (this.comparisonReader !== null) {
      (this.gui as HackAssemblerGUI).getComparison().clearHighlights();
      (this.gui as HackAssemblerGUI).getComparison().hideSelect();
    }
  }

  // If the line is a label, returns null.
  protected compileLine(line: string) {
    try {
      const input: AssemblyLineTokenizer = new AssemblyLineTokenizer(line);

      if (!input.isEnd() && !input.isToken('(')) {
        if (input.isToken('@')) {
          input.advance(true);
          let numeric: boolean = true;
          const label: string = input.token();
          input.ensureEnd();
          if (isNaN(parseInt(label, 10))) {
            numeric = false;
          }

          if (!numeric) {
            let address: number = this.symbolTable.get(label);
            if (address === undefined) {
              address = this.varIndex++;
              this.symbolTable.put(label, address);
            }

            this.addCommand(this.translator.textToCode('@' + address));
          } else {
            this.addCommand(this.translator.textToCode(line));
          }
        } else {
          // try to compile normaly, if error - try to compile as compact assembly
          try {
            this.addCommand(this.translator.textToCode(line));
          } catch (ae) {
            const openAddressPos: number = line.indexOf('[');
            if (openAddressPos >= 0) {
              const lastPos: number = line.lastIndexOf('[');
              const closeAddressPos: number = line.indexOf(']');

              if (
                openAddressPos !== lastPos ||
                openAddressPos > closeAddressPos ||
                openAddressPos + 1 === closeAddressPos
              ) {
                throw new AssemblerException('Illegal use of the [] notation');
              }

              const address: string = line.substring(
                openAddressPos + 1,
                closeAddressPos,
              );
              this.compileLine('@' + address);
              this.compileLine(
                line
                  .substring(0, openAddressPos)
                  .concat(line.substring(closeAddressPos + 1)),
              );
            } else {
              throw new AssemblerException(ae.message);
            }
          }
        }
      }
    } catch (ae) {
      throw new HackTranslatorException(
        `${ae.message}, sourcePC: ${this.sourcePC}`,
      );
    }
  }

  protected finalizeCompilation() {}

  // Checks the given comparison file name and throws an AssemblerException
  // if not legal.
  private checkComparisonFile(fileName: string) {
    if (!fileName.endsWith('.' + this.getDestinationExtension())) {
      throw new HackTranslatorException(
        fileName + ' is not a .' + this.getDestinationExtension() + ' file',
      );
    }

    const file: string | null = localStorage.getItem(fileName);
    if (file === null) {
      throw new HackTranslatorException('File ' + fileName + ' does not exist');
    }
  }

  // opens the comparison file for reading.
  private resetComparisonFile() {
    try {
      if (this.comparisonFileName !== null) {
        this.comparisonReader = localStorage.getItem(this.comparisonFileName);
      }

      if (this.gui !== null) {
        const comp: TextFileGUI = (this
          .gui as HackAssemblerGUI).getComparison();
        comp.reset();
        if (this.comparisonFileName !== null) {
          comp.setContents(this.comparisonFileName);
        }

        this.comparisonProgram = [];
        for (let i = 0; i < comp.getNumberOfLines(); i++) {
          if (comp.getLineAt(i).length !== Definitions.BITS_PER_WORD) {
            throw new HackTranslatorException(
              'Error in file ' +
                this.comparisonFileName +
                ': Line ' +
                i +
                ' does not contain exactly ' +
                Definitions.BITS_PER_WORD +
                ' characters',
            );
          }
          try {
            this.comparisonProgram[i] = Conversions.binaryToInt(
              comp.getLineAt(i),
            );
          } catch (nfe) {
            throw new HackTranslatorException(
              'Error in file ' +
                this.comparisonFileName +
                ': Line ' +
                i +
                ' does not contain only 1/0 characters',
            );
          }
        }
      }
    } catch (ioe) {
      throw new HackTranslatorException(
        'Error reading from file ' + this.comparisonFileName,
      );
    }
  }

  // Generates The symbol table by attaching each label with it's appropriate
  // value according to it's location in the program
  private generateSymbolTable() {
    this.symbolTable = Definitions.getInstance().getAddressesTable();
    let pc: number = 0;
    let label: string;

    try {
      const sourceReader: string | null = localStorage.getItem(
        this.sourceFileName,
      );
      if (sourceReader !== null) {
        const lines: string[] = sourceReader.split('\n');

        for (const line of lines) {
          const input: AssemblyLineTokenizer = new AssemblyLineTokenizer(line);

          if (!input.isEnd()) {
            if (input.isToken('(')) {
              input.advance(true);
              label = input.token();
              input.advance(true);
              if (!input.isToken(')')) {
                this.error("')' expected");
              }

              input.ensureEnd();
              this.symbolTable.put(label, pc);
            } else if (input.contains('[')) {
              pc += 2;
            } else {
              pc++;
            }
          }
        }
      } else {
        throw new HackTranslatorException(
          'The following file does not exist: ' + this.sourceFileName,
        );
      }
    } catch (e) {
      throw new HackTranslatorException(
        e.message || 'Error reading from file ' + this.sourceFileName,
      );
    }
  }

  // Compares the given commands to the next commands in the comparison file.
  private compare(compiledRange: number[]): boolean {
    let result: boolean = true;
    const length: number = compiledRange[1] - compiledRange[0] + 1;

    for (let i = 0; i < length && result; i++) {
      result =
        this.program[compiledRange[0] + i] ===
        this.comparisonProgram[compiledRange[0] + i];
    }

    return result;
  }
}

export default HackAssembler;
