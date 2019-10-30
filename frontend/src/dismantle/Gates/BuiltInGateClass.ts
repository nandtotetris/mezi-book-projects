import {
  BuiltInGate,
  BuiltInGateWithGUI,
  Gate,
  GateClass,
  GatesManager,
  HDLTokenizer,
  Node,
  PinInfo,
} from 'dismantle/Gates/internal';

/**
 * A GateClass for Built In gates.
 */
export default class BuiltInGateClass extends GateClass {
  // the java class that holds the basic gate functionality
  private gateClass: string = '';

  /**
   * Constructs a new BuiltInGateClass with the given gate name and the HDLTokenizer
   * input which is positioned just after the BUILTIN declaration.
   * The HDL's input and output pin names are also given.
   */
  constructor(
    gateName: string,
    input: HDLTokenizer,
    inputPinsInfo: PinInfo[],
    outputPinsInfo: PinInfo[],
  ) {
    super(gateName, inputPinsInfo, outputPinsInfo);

    // read java class name
    input.advance();
    if (input.getTokenType() !== HDLTokenizer.TYPE_IDENTIFIER) {
      input.HDLError('Missing java class name');
    }

    // check that the class is a subclass of BuiltInGate

    // read ';' symbol
    input.advance();
    if (
      !(
        input.getTokenType() === HDLTokenizer.TYPE_SYMBOL &&
        input.getSymbol() === ';'
      )
    ) {
      input.HDLError("Missing ';'");
    }

    this.isInputClocked = [];
    this.isOutputClocked = [];

    input.advance();

    // check if clocked keyword exists
    if (input.getTokenType() === HDLTokenizer.TYPE_KEYWORD) {
      if (input.getKeywordType() != HDLTokenizer.KW_CLOCKED) {
        input.HDLError('Unexpected keyword');
      }

      this.isItClocked = true;

      // read clocked input pins list
      const clockedNames: string[] = BuiltInGateClass.readPinNames(input);

      for (const clockedName of clockedNames) {
        let inputFound: boolean = false;
        let outputFound: boolean = false;
        // check if clocked name is an input pin
        for (let j = 0; j < this.isInputClocked.length && !inputFound; j++) {
          if (!this.isInputClocked[j]) {
            inputFound = inputPinsInfo[j].name === clockedName;
            this.isInputClocked[j] = inputFound;
          }
        }
        if (!inputFound) {
          // check if clocked name is an output pin
          for (
            let j = 0;
            j < this.isOutputClocked.length && !outputFound;
            j++
          ) {
            if (!this.isOutputClocked[j]) {
              outputFound = outputPinsInfo[j].name === clockedName;
              this.isOutputClocked[j] = outputFound;
            }
          }
        }
      }

      input.advance();
    }

    if (
      !(
        input.getTokenType() === HDLTokenizer.TYPE_SYMBOL &&
        input.getSymbol() === '}'
      )
    ) {
      input.HDLError("Missing '}'");
    }
  }

  /**
   * Creates and returns a new instance of BuiltInGate.
   */
  newInstance(): Gate {
    let result: BuiltInGate;

    const inputNodes: Node[] = [];
    const outputNodes: Node[] = [];

    for (let i = 0; i < inputNodes.length; i++) {
      inputNodes[i] = new Node();
    }

    for (let i = 0; i < outputNodes.length; i++) {
      outputNodes[i] = new Node();
    }

    try {
      result = this.newGateInstance(this.gateClass);
    } catch (iae) {
      throw new Error(iae.getMessage());
    }

    result.init(inputNodes, outputNodes, this);

    // if the gate has a gui component, add the gate to the gate manager
    // and set it to be its own parent for eval notifications
    if (result instanceof BuiltInGateWithGUI) {
      GatesManager.getInstance().addChip(result as BuiltInGateWithGUI);
    }

    // Add a DirtyGateAdapter as a listener to all the non-clocked inputs,
    // so the gate will become dirty when one of its non-clocked input changes.
    let adapter = new DirtyGateAdapter(result);
    for (let i = 0; i < this.isInputClocked.length; i++) {
      if (!this.isInputClocked[i]) {
        inputNodes[i].addListener(adapter);
      }
    }

    return result;
  }

  private newGateInstance(gateClass: string) {
    return new Object();
  }
}
