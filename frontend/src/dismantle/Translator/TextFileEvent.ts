import EventObject from './EventObject';
/**
 * An event for notifying an TextFileEventListener on a change in the selected row.
 */
class TextFileEvent extends EventObject {
  // the changed row index;
  private rowIndex: number;

  // the changed row string
  private rowString: string;

  /**
   * Constructs a new TextFileEvent with the given source and the selected row
   * string and index.
   */
  constructor(source: object, rowString: string, rowIndex: number) {
    super(source);
    this.rowString = rowString;
    this.rowIndex = rowIndex;
  }

  /**
   * Returns the selected row String.
   */
  public getRowString(): string {
    return this.rowString;
  }

  /**
   * Returns the selected row index.
   */
  public getRowIndex(): number {
    return this.rowIndex;
  }
}

export default TextFileEvent;
