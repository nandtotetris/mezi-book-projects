import Hashtable from 'dismantle/Common/Hashtable';
import Vector from 'dismantle/Common/Vector';
import {
  Gate,
  GatesManager,
  HDLException,
  HDLTokenizer,
  PinInfo,
} from 'dismantle/Gates/internal';
/**
 * A factory and information source for gates.
 */
abstract class GateClass {
  /**
   * The input pin type
   */
  static readonly UNKNOWN_PIN_TYPE: number = 0;

  /**
   * The input pin type
   */
  static readonly INPUT_PIN_TYPE: number = 1;

  /**
   * The output pin type
   */
  static readonly OUTPUT_PIN_TYPE: number = 2;

  /**
   * Returns the GateClass associated with the given gate name.
   * If containsPath is true, the gate name is assumed to contain the full
   * path of the hdl file. If doesn't contain path, looks for the hdl file
   * according to the directory hierarchy.
   * If the GateClass doesn't exist yet, creates the GateClass by parsing the hdl file.
   */
  static getGateClass(gateName: string, containsPath: boolean): GateClass {
    let fileName: string = '';

    // find hdl file name according to the gate name.
    if (!containsPath) {
      fileName = GatesManager.getInstance().getHDLFileName(gateName);
      if (fileName === null) {
        throw new HDLException(
          'Chip ' +
            gateName +
            ' is not found in the working and built in folders',
        );
      }
    } else {
      gateName = gateName.substring(0, gateName.lastIndexOf('.'));
      fileName = `${gateName}HDL`;
      if (localStorage.getItem(fileName) === null) {
        throw new HDLException('Chip ' + fileName + " doesn't exist");
      }
    }

    // Try to find the gate in the "cache"
    let result: GateClass = GateClass.GateClasses.get(fileName);

    // gate wasn't found in cache
    if (result == null) {
      const input: HDLTokenizer = new HDLTokenizer(fileName);
      result = GateClass.readHDL(input, gateName);
      GateClass.GateClasses.put(fileName, result);
    }

    return result;
  }

  /**
   * Clears the gate Cache
   */
  static clearGateCache() {
    GateClass.GateClasses.clear();
  }

  /**
   * Returns true if a GateClass exists for the given gate name.
   */
  static gateClassExists(gateName: string): boolean {
    const fileName: string = GatesManager.getInstance().getHDLFileName(
      gateName,
    );
    return GateClass.GateClasses.get(fileName) !== undefined;
  }

  // a table that maps a gate name with its GateClass
  protected static GateClasses: Hashtable = new Hashtable();

  // Returns an array of pin names read from the input (names may contain width specification).
  protected static readPinNames(input: HDLTokenizer): string[] {
    const list: Vector = new Vector();
    let exit: boolean = false;
    input.advance();

    while (!exit) {
      // check ';' symbol
      if (
        input.getTokenType() === HDLTokenizer.TYPE_SYMBOL &&
        input.getSymbol() === ';'
      ) {
        exit = true;
      } else {
        // read pin name
        if (input.getTokenType() !== HDLTokenizer.TYPE_IDENTIFIER) {
          input.HDLError('Pin name expected');
        }

        const pinName: string = input.getIdentifier();
        list.addElement(pinName);

        // check seperator
        input.advance();
        if (
          !(
            input.getTokenType() === HDLTokenizer.TYPE_SYMBOL &&
            (input.getSymbol() === ',' || input.getSymbol() === ';')
          )
        ) {
          input.HDLError("',' or ';' expected");
        }
        if (
          input.getTokenType() === HDLTokenizer.TYPE_SYMBOL &&
          input.getSymbol() === ','
        ) {
          input.advance();
        }
      }
    }

    const result: string[] = [];
    list.toArray(result);
    return result;
  }

  // Loads the HDL from the given input, creates the appropriate GateClass and returns it.
  private static readHDL(input: HDLTokenizer, gateName: string): GateClass {
    // read CHIP keyword
    input.advance();
    if (
      !(
        input.getTokenType() === HDLTokenizer.TYPE_KEYWORD &&
        input.getKeywordType() === HDLTokenizer.KW_CHIP
      )
    ) {
      input.HDLError("Missing 'CHIP' keyword");
    }

    // read gate name
    input.advance();
    if (input.getTokenType() !== HDLTokenizer.TYPE_IDENTIFIER) {
      input.HDLError('Missing chip name');
    }
    const foundGateName: string = input.getIdentifier();
    if (gateName !== foundGateName) {
      input.HDLError("Chip name doesn't match the HDL name");
    }

    // read '{' symbol
    input.advance();
    if (
      !(
        input.getTokenType() === HDLTokenizer.TYPE_SYMBOL &&
        input.getSymbol() === '{'
      )
    ) {
      input.HDLError("Missing '{'");
    }

    // read IN keyword
    let inputPinsInfo: PinInfo[];
    let outputPinsInfo: PinInfo[];
    input.advance();
    if (
      input.getTokenType() === HDLTokenizer.TYPE_KEYWORD &&
      input.getKeywordType() === HDLTokenizer.KW_IN
    ) {
      // read input pins list
      inputPinsInfo = GateClass.getPinsInfo(
        input,
        GateClass.readPinNames(input),
      );
      input.advance();
    } else {
      // no input pins
      inputPinsInfo = [];
    }

    // read OUT keyword
    if (
      input.getTokenType() === HDLTokenizer.TYPE_KEYWORD &&
      input.getKeywordType() === HDLTokenizer.KW_OUT
    ) {
      // read output pins list
      outputPinsInfo = GateClass.getPinsInfo(
        input,
        GateClass.readPinNames(input),
      );
      input.advance();
    } else {
      // no output pins
      outputPinsInfo = [];
    }

    let result: GateClass | null = null;

    // read BuiltIn/Parts keyword
    if (
      input.getTokenType() === HDLTokenizer.TYPE_KEYWORD &&
      input.getKeywordType() === HDLTokenizer.KW_BUILTIN
    ) {
      result = new BuiltInGateClass(
        gateName,
        input,
        inputPinsInfo,
        outputPinsInfo,
      );
    } else if (
      input.getTokenType() === HDLTokenizer.TYPE_KEYWORD &&
      input.getKeywordType() === HDLTokenizer.KW_PARTS
    ) {
      result = new CompositeGateClass(
        gateName,
        input,
        inputPinsInfo,
        outputPinsInfo,
      );
    } else {
      input.HDLError('Keyword expected');
    }

    return result;
  }

  // Returns a PinInfo array according to the given pin names
  // (which may contain width specification).
  private static getPinsInfo(input: HDLTokenizer, names: string[]): PinInfo[] {
    const result: PinInfo[] = [];

    for (let i = 0; i < names.length; i++) {
      result[i] = new PinInfo();
      const bracketsPos: number = names[i].indexOf('[');
      if (bracketsPos >= 0) {
        try {
          const width: string = names[i].substring(
            bracketsPos + 1,
            names[i].indexOf(']'),
          );
          result[i].width = parseInt(width, 10);
          result[i].name = names[i].substring(0, bracketsPos);
        } catch {
          input.HDLError(names[i] + ' has an invalid bus width');
        }
      } else {
        result[i].width = 1;
        result[i].name = names[i];
      }
    }

    return result;
  }

  // input and output pin names
  protected inputPinsInfo: PinInfo[] = [];
  protected outputPinsInfo: PinInfo[] = [];

  // The name of the gate
  protected name: string = '';

  // true if this gate is clocked
  protected isItClocked: boolean = false;

  // true if the corresponding input is clocked
  protected isInputClocked: boolean[] = [];

  // true if the corresponding output is clocked
  protected isOutputClocked: boolean[] = [];

  // Mapping from pin names to their types (INPUT_PIN_TYPE, OUTPUT_PIN_TYPE)
  protected namesToTypes: Hashtable;

  // Mapping from pin names to their numbers (Integer objects)
  protected namesToNumbers: Hashtable;

  // Constructs a new GateCLass (public access through the getGateClass method)
  protected constructor(
    gateName: string,
    inputPinsInfo: PinInfo[],
    outputPinsInfo: PinInfo[],
  ) {
    this.namesToTypes = new Hashtable();
    this.namesToNumbers = new Hashtable();

    this.name = gateName;

    this.inputPinsInfo = inputPinsInfo;
    this.registerPins(inputPinsInfo, GateClass.INPUT_PIN_TYPE);
    this.outputPinsInfo = outputPinsInfo;
    this.registerPins(outputPinsInfo, GateClass.OUTPUT_PIN_TYPE);
  }

  /**
   * Returns the PinInfo according to the given pin type and number.
   * If doesn't exist, return null.
   */
  getPinInfo(typeOrName: string | number, num?: number = 0): PinInfo | null {
    if (typeof typeOrName === 'number') {
      const type: number = typeOrName as number;
      let result: PinInfo | null = null;
      switch (type) {
        case GateClass.INPUT_PIN_TYPE:
          if (num < this.inputPinsInfo.length) {
            result = this.inputPinsInfo[num];
          }
          break;
        case GateClass.OUTPUT_PIN_TYPE:
          if (num < this.outputPinsInfo.length) {
            result = this.outputPinsInfo[num];
          }
          break;
      }
      return result;
    } else {
      const type: number = this.getPinType(typeOrName);
      const index: number = this.getPinNumber(name);
      return this.getPinInfo(type, index);
    }
  }

  /**
   * Returns the type of the given pinName.
   * If not found, returns UNKNOWN_PIN_TYPE.
   */
  public getPinType(pinName: string): number {
    const result: number = this.namesToTypes.get(pinName);
    return result !== null ? result : GateClass.UNKNOWN_PIN_TYPE;
  }

  /**
   * Returns the number of the given pinName.
   * If not found, returns -1.
   */
  getPinNumber(pinName: string): number {
    const result: number = this.namesToNumbers.get(pinName);
    return result !== null ? result : -1;
  }

  /**
   * Returns the name of the gate.
   */
  getName(): string {
    return name;
  }

  /**
   * Returns true if this gate is clocked.
   */
  isClocked(): boolean {
    return this.isItClocked;
  }

  /**
   * Creates and returns a new Gate instance of this GateClass type.
   */
  abstract newInstance(): Gate;

  /**
   * Registers the given pins with their given type and numbers.
   */
  protected registerPins(pins: PinInfo[], type: number) {
    for (let i = 0; i < pins.length; i++) {
      this.namesToTypes.put(pins[i].name, type);
      this.namesToNumbers.put(pins[i].name, i);
    }
  }

  /**
   * Registers the given pin with its given type and number.
   */
  protected registerPin(pin: PinInfo, type: number, num: number) {
    this.namesToTypes.put(pin.name, type);
    this.namesToNumbers.put(pin.name, num);
  }
}

export default GateClass;
