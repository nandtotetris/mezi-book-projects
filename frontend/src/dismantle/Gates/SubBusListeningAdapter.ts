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
    let masked1: number = (this.targetNode.get() & ~this.mask);
    let masked2: number = (
      (((value << this.shiftLeft)) & this.mask)
    );
    this.targetNode.set((masked1 | masked2));
  }
}
