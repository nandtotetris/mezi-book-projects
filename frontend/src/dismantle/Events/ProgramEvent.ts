import EventObject from './EventObject';
/**
 * An event for notifying a ProgramEventListener on a request for a new program.
 */
class ProgramEvent extends EventObject {
  /**
   * event type for notifying on a new loaded program.
   * supplied data = program file name (String)
   */
  public static readonly LOAD: number = 1;

  /**
   * event type for notifying on a new saved program.
   * supplied data = program file name (String)
   */
  public static readonly SAVE: number = 2;

  /**
   * event type for notifying that the program was cleared.
   * supplied data = null
   */
  public static readonly CLEAR: number = 3;

  // The program's file name.
  private programFileNames: string[] = [];

  // The type of the event.
  private eventType: number;

  /**
   * Constructs a new ProgramEvent with the given source, event type and the new program
   * file name (or null if not applicable).
   */
  public constructor(
    source: object,
    eventType: number,
    programFileNames: string[],
  ) {
    super(source);
    this.programFileNames = programFileNames;
    this.eventType = eventType;
  }

  /**
   * Returns the new program's file name.
   */
  public getProgramFileNames(): string[] {
    return this.programFileNames;
  }

  /**
   * Returns the event type.
   */
  public getType(): number {
    return this.eventType;
  }
}

export default ProgramEvent;
