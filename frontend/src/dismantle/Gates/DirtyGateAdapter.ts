import { Gate, Node } from 'dismantle/Gates/internal';

export default class DirtyGateAdapter extends Node {
  private affectedGate: Gate;
  constructor(gate: Gate) {
    super();
    this.affectedGate = gate;
  }
  public set(value: number): void {
    super.set(value);
    this.affectedGate.setDirty();
  }
}
