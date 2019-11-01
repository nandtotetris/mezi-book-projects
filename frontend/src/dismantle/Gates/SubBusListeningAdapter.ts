import { Node, SubNode } from 'dismantle/Gates/internal';

export default class SubBusListeningAdapter extends Node {
  private mask: number;
  private shiftLeft: number;
  private targetNode: Node;
  constructor(targetNode: Node, low: number, high: number) {
    super();
    this.mask = SubNode.getMask(low, high);
    this.shiftLeft = low;
    this.targetNode = targetNode;
  }
  public set(value: number): void {
    // tslint:disable-next-line: no-bitwise
    const masked1: number = this.targetNode.get() & ~this.mask;
    const masked2: number =
      // tslint:disable-next-line: no-bitwise
      (value << this.shiftLeft) & this.mask;
    // tslint:disable-next-line: no-bitwise
    this.targetNode.set(masked1 | masked2);
  }
}
