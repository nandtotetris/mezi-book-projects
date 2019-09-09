import HackTranslatorEvent from './HackTranslatorEvent';
/**
 * An event for notifying a HackAssemblerEventListener on an action that should be taken,
 * together with a data object which is supplied with the action code.
 */
class HackAssemblerEvent extends HackTranslatorEvent {
  /**
   * Action code for changing the comparison file.
   * supplied data = comparison file name (String)
   */
  public static readonly COMPARISON_LOAD: number = 9;

  /**
   * Constructs a new HackAssemblerEvent with given source, the action code and the supplied data.
   */
  constructor(source: object, action: number, data: object) {
    super(source, action, data);
  }
}

export default HackAssemblerEvent;
