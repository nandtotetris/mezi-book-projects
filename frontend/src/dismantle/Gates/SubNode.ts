import { Node } from 'dismantle/Gates/internal';
import Shifter from 'dismantle/Utilities/Shifter';
/**
 * A node that represents a sub-bus.
 */
class SubNode extends Node {
  /**
   * Returns a mask according to the given low & high bit indice.
   */
  public static getMask(low: number, high: number): number {
    let mask: number = 0;
    let bitHolder: number = Shifter.powersOf2[low];
    for (let i: number = low; i <= high; i++) {
      // tslint:disable-next-line: no-bitwise
      mask |= bitHolder;
      // tslint:disable-next-line: no-bitwise
      bitHolder = bitHolder << 1;
    }
    return mask;
  }
  // The mask which filters out the non-relevant part of the sub-node
  private mask: number;

  // The amount of bits to shift right the masked value
  private shiftRight: number;

  /**
   * Constructs a new SubNode with the given low & high sub-bus indice.
   */
  constructor(low: number, high: number) {
    super();
    this.mask = SubNode.getMask(low, high);
    this.shiftRight = low;
  }

  /**
   * Returns the value of this sub-node.
   */
  public get(): number {
    // tslint:disable-next-line: no-bitwise
    return Shifter.unsignedShiftRight(this.value & this.mask, this.shiftRight);
  }
}
