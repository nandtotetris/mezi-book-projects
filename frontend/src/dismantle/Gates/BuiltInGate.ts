import { Gate, GateClass, Node } from 'dismantle/Gates/internal';
/**
 * A BuiltIn Gate. The base class for all gates which are implemented in java.
 */
export default abstract class BuiltInGate extends Gate {
  clockUp() {}

  clockDown() {}

  reCompute() {}

  /**
   * Initializes the gate
   */
  init(inputPins: Node[], outputPins: Node[], gateClass: GateClass): void {
    this.inputPins = inputPins;
    this.outputPins = outputPins;
    this.gateClass = gateClass;
    this.setDirty();
  }
}
