/**
 * Format conversion utilities
 */
class Conversions {
  /**
   * If the given string starts with %X, %B or %D translates it to a normal decimal form.
   * If the given string is a decimal number, translates it into a normal decimal form.
   * Otherwise, return the given string as is.
   */
  public static toDecimalForm(value: string): string {
    if (value.startsWith('%B')) {
      value = '' + Conversions.binaryToInt(value.substring(2));
    } else if (value.startsWith('%X')) {
      if (value.length === 6) {
        value = '' + Conversions.hex4ToInt(value.substring(2));
      } else {
        value = '' + Conversions.hexToInt(value.substring(2));
      }
    } else if (value.startsWith('%D')) {
      value = value.substring(2);
    } else {
      try {
        const intValue: number = parseInt(value, 10);
        value = '' + intValue;
      } catch {}
    }

    return value;
  }

  /**
   * Returns the decimal int representation of the given binary value.
   * The binary value is given as a string of 0's and 1's. If any other character
   * appears in the given string, a NumberFormatException is thrown.
   */
  public static binaryToInt(value: string): number {
    let result: number = 0;

    // tslint:disable-next-line: no-bitwise
    for (let i = value.length - 1, mask = 1; i >= 0; i--, mask = mask << 1) {
      const bit: string = value[i];
      if (bit === '1') {
        // tslint:disable-next-line: no-bitwise
        result = result | mask;
      } else if (bit !== '0') {
        throw new Error('Number format exception');
      }
    }

    return result;
  }

  /**
   * Returns the decimal int representation of the given hexadecimal value.
   * The hexadecimal value is given as a string of 0-9, a-f. If any other character
   * appears in the given string, a NumberFormatException is thrown.
   */
  public static hexToInt(value: string): number {
    let result: number = 0;
    let multiplier: number = 1;

    for (let i = value.length - 1; i >= 0; i--, multiplier *= 16) {
      const digit: string = value[i];
      const digitVal: number = digit.charCodeAt(0);
      if (digit >= '0' && digit <= '9') {
        result += (digitVal - '0'.charCodeAt(0)) * multiplier;
      } else if (digit >= 'a' && digit <= 'f') {
        result += (digitVal - 'a'.charCodeAt(0) + 10) * multiplier;
      } else if (digit >= 'A' && digit <= 'F') {
        result += (digitVal - 'A'.charCodeAt(0) + 10) * multiplier;
      } else {
        throw new Error('Number format exception');
      }
    }

    return result;
  }

  /**
   * Returns the decimal int representation of the given 4-digit hexadecimal value.
   * The hexadecimal value is given as a string of 0-9, a-f. If any other character
   * appears in the given string, a NumberFormatException is thrown.
   * The given value is assumed to have exactly 4 digits.
   */
  public static hex4ToInt(value: string): number {
    let result: number = Conversions.hexToInt(value);

    if (result > 32767) {
      result -= 65536;
    }

    return result;
  }

  /**
   * Returns the binary string representation of the given int value, adding
   * preceeding zeros if the result contains less digits than the given amount of digits.
   */
  public static decimalToBinary(value: number, numOfDigits: number): string {
    // tslint:disable-next-line: no-bitwise
    value = value & (Conversions.powersOf2[numOfDigits] - 1);
    let result: string = Number(value).toString(2);
    if (result.length < numOfDigits) {
      result =
        Conversions.ZEROS.substring(0, numOfDigits - result.length) + result;
    }
    return result;
  }

  /**
   * Returns the hexadeimal string representation of the given int value, adding
   * preceeding zeros if the result contains less digits than the given amount of digits.
   */
  public static decimalToHex(value: number, numOfDigits: number): string {
    // tslint:disable-next-line: no-bitwise
    value = value & (Conversions.powersOf16[numOfDigits] - 1);
    let result: string = Number(value).toString(16);
    if (result.length < numOfDigits) {
      result =
        Conversions.ZEROS.substring(0, numOfDigits - result.length) + result;
    }
    return result;
  }
  // A helper string of zeros
  private static readonly ZEROS: string =
    '0000000000000000000000000000000000000000';

  // A helper array of powers of two
  private static readonly powersOf2: number[] = [
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
    32768,
    65536,
    131072,
    262144,
    524288,
    1048576,
    2097152,
    4194304,
    8388608,
    16777216,
    33554432,
    67108864,
    134217728,
    268435456,
    536870912,
    1073741824,
    -2147483648,
  ];

  // A helper array of powers of 16
  private static readonly powersOf16: number[] = [
    1,
    16,
    256,
    4096,
    65536,
    1048576,
    16777216,
    268435456,
  ];
}

export default Conversions;
