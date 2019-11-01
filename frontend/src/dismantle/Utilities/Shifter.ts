export default class Shifter {
  public static powersOf2: number[] = [
    1,
    2,
    4,
    8,
    16,
    32,
    64,
    128,
    256,
    512,
    1024,
    2048,
    4096,
    8192,
    16384,
    -32768,
  ];
  public static unsignedShiftRight(value: number, shiftBits: number): number {
    let result: number;
    if (value >= 0) {
      // tslint:disable-next-line: no-bitwise
      result = value >> shiftBits;
    } else {
      // tslint:disable-next-line: no-bitwise
      value &= 0x7fff;
      // tslint:disable-next-line: no-bitwise
      result = value >> shiftBits;
      // tslint:disable-next-line: no-bitwise
      result |= Shifter.powersOf2[15 - shiftBits];
    }
    return result;
  }
}
