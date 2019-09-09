import ProgramEvent from './ProgramEvent';
/**
 * An interface for objects that wants to listen to the ProgramEvent.
 */
// tslint:disable-next-line: interface-name
interface ProgramEventListener {
  /**
   * Called when the current program is changed.
   * The event contains the source object, and the new program's file name.
   */
  programChanged(event: ProgramEvent): void;
}

export default ProgramEventListener;
