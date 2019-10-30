import { hashCode } from 'dismantle/Utilities/hashCode';

/**
 * Holds information on a gate's pin.
 */
class PinInfo {
  /**
   * The name of the gate's pin.
   */
  name: string;

  /**
   * The width of the pin's bus.
   */
  width: number;

  /**
   * The value at the pin.
   */
  value: number = 0;

  // Initialization marking.
  initialized: boolean[];

  /**
   * Constructs a new PinInfo with the given name and width.
   */
  constructor(name?: string, width?: number) {
    this.initialized = [];
    this.name = name || '';
    this.width = width || 0;
  }

  /**
   * Marks the given sub bus as initialized.
   * If subBus is null, all the pin is initialized.
   */
  initialize(subBus: number[]) {
    let from: number;
    let to: number;

    if (subBus !== null) {
      from = subBus[0];
      to = subBus[1];
    } else {
      from = 0;
      to = this.width - 1;
    }
    for (let i = from; i <= to; i++) {
      this.initialized[i] = true;
    }
  }

  /**
   * Checks whether the given sub bus is marked as initialized.
   * If subBus is null, all the pin is checked.
   */
  isInitialized(subBus: number[]): boolean {
    let found: boolean = false;
    let from: number;
    let to: number;

    if (subBus !== null) {
      from = subBus[0];
      to = subBus[1];
    } else {
      from = 0;
      to = this.width - 1;
    }
    for (let i = from; i <= to && !found; i++) {
      found = this.initialized[i];
    }
    return found;
  }

  hashCode(): number {
    return hashCode(this.name);
  }

  public equals(other: any): boolean {
    return other instanceof PinInfo && name === other.name;
  }
}

export default PinInfo;
