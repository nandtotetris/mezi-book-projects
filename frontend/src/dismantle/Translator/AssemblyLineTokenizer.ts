import LineTokenizer from './LineTokenizer';

/**
 * A tokenizer for lines of an Assembly program.
 */
class AssemblyLineTokenizer extends LineTokenizer {
  /**
   * Removes space characters from the given string.
   */
  private static removeSpaces(line: string): string {
    let stripped: string = '';
    for (const c of line) {
      if (c !== ' ') {
        stripped += c;
      }
    }
    return stripped;
  }

  /**
   * Constructs a new AssemblyLineTokenizer for the given line.
   */
  constructor(line: string) {
    // Remove spaces from line. This needs to be done here
    // manually and not via whitespaceChars(' ', ' ') because
    // A + 1 for example should be regarded as the SINGLE
    // token A+1.
    super(AssemblyLineTokenizer.removeSpaces(line));

    // this.resetSyntax();
    this.slashSlashComments();
    // this.parseNumbers();
    this.whiteSpaceCharsSnrt();
    this.wordCharsForLineTokenizer();

    this.nextToken();
  }
}

export default AssemblyLineTokenizer;
