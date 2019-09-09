class StringTokenizer {
  // The current token object
  private currentIndex: number = -1;

  // current input
  private input: string = '';

  // token array
  private tokenArray: string[] = [];

  constructor(line: string) {
    this.input = line.trim();
    this.tokenArray = this.input.split(' ');
  }

  public nextToken(): string {
    this.currentIndex++;
    if (this.currentIndex < this.tokenArray.length) {
      return this.tokenArray[this.currentIndex].trim();
    } else {
      return '';
    }
  }

  public hasMoreTokens(): boolean {
    return this.currentIndex + 1 < this.tokenArray.length;
  }

  /**
   * Counts the number of tokens
   */
  public countTokens(): number {
    return this.tokenArray.length;
  }
}

export default StringTokenizer;
