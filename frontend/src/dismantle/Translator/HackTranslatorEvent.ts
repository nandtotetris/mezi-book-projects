import EventObject from './EventObject';

/**
 * An event for notifying a HackTranslatorEventListener on an action that should be taken,
 * together with a data object which is supplied with the action code.
 */
class HackTranslatorEvent extends EventObject {
  /**
   * Action code for performing the single step operation.
   * supplied data = null
   */
  public static readonly SINGLE_STEP: number = 1;

  /**
   * Action code for performing the fast forward operation.
   * supplied data = null
   */
  public static readonly FAST_FORWARD: number = 2;

  /**
   * Action code for performing the stop operation.
   * supplied data = null
   */
  public static readonly STOP: number = 3;

  /**
   * Action code for performing the rewind operation.
   * supplied data = null
   */
  public static readonly REWIND: number = 4;

  /**
   * Action code for performing the Full Compilation operation.
   * supplied data = null
   */
  public static readonly FULL_COMPILATION: number = 5;

  /**
   * Action code for saving the dest file.
   * supplied data = dest file name (String)
   */
  public static readonly SAVE_DEST: number = 6;

  /**
   * Action code for loading a source file.
   * supplied data = source file name (String)
   */
  public static readonly SOURCE_LOAD: number = 7;

  // the action code
  private action: number;

  // the supplied data
  private data: any;

  /**
   * Constructs a new HackTranslatorEvent with given source, the action code and the supplied data.
   */
  constructor(source: object, action: number, data: any) {
    super(source);
    this.action = action;
    this.data = data;
  }

  /**
   * Returns the event's action code.
   */
  public getAction(): number {
    return this.action;
  }

  /**
   * Returns the event's supplied data.
   */
  public getData(): any {
    return this.data;
  }
}

export default HackTranslatorEvent;
