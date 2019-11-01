export default class Connection {
  public static FROM_INPUT: number = 1;
  public static TO_INTERNAL: number = 2;
  public static FROM_INTERNAL: number = 3;
  public static TO_OUTPUT: number = 5;
  public static FROM_TRUE: number = 6;
  public static FROM_FALSE: number = 7;
  public static FROM_CLOCK: number = 8;
  private type: number;
  private gatePinNumber: number;
  private partNumber: number;
  private partPinName: string;
  private partSubBus: Int8Array | null;
  private gateSubBus: Int8Array | null;

  constructor(
    type: number,
    gatePinNumber: number,
    partNumber: number,
    partPinName: string,
    gateSubBus: Int8Array | null,
    partSubBus: Int8Array | null,
  ) {
    this.type = type;
    this.gatePinNumber = gatePinNumber;
    this.partNumber = partNumber;
    this.partPinName = partPinName;
    this.gateSubBus = gateSubBus;
    this.partSubBus = partSubBus;
  }
  public getType(): number {
    return this.type;
  }
  public getGatePinNumber(): number {
    return this.gatePinNumber;
  }
  public getPartNumber(): number {
    return this.partNumber;
  }
  public getPartPinName(): string {
    return this.partPinName;
  }
  public getGateSubBus(): Int8Array | null {
    return this.gateSubBus;
  }
  public getPartSubBus(): Int8Array | null {
    return this.partSubBus;
  }
}
