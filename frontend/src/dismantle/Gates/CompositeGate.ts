import {
  CompositeGateClass,
  Gate,
  GateClass,
  Node,
} from 'dismantle/Gates/internal';

export default class CompositeGate extends Gate {
  public internalPins: Node[] = [];
  public parts: Gate[] = [];
  public clockUp(): void {
    if (this.gateClass.isClocked) {
      for (const part of this.parts) {
        part.tick();
      }
    }
  }
  public clockDown(): void {
    if (this.gateClass.isClocked) {
      for (const part of this.parts) {
        part.tock();
      }
    }
  }
  public reCompute(): void {
    for (const part of this.parts) {
      part.eval();
    }
  }
  public getNode(name: string): Node {
    let result: Node = super.getNode(name);
    if (result === null) {
      const type: number = this.gateClass.getPinType(name);
      const index: number = this.gateClass.getPinNumber(name);
      if (type === CompositeGateClass.INTERNAL_PIN_TYPE) {
        result = this.internalPins[index];
      }
    }
    return result;
  }
  public getInternalNodes(): Node[] {
    return this.internalPins;
  }
  public getParts(): Gate[] {
    return this.parts;
  }
  public init(
    inputPins: Node[],
    outputPins: Node[],
    internalPins: Node[],
    parts: Gate[],
    gateClass: GateClass,
  ): void {
    this.inputPins = inputPins;
    this.outputPins = outputPins;
    this.internalPins = internalPins;
    this.parts = parts;
    this.gateClass = gateClass;
    this.setDirty();
  }
}
