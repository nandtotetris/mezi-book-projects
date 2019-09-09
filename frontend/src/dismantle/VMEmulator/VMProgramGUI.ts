import InteractiveComputerPartGUI from '../ComputerParts/InteractiveComputerPartGUI';
import ProgramEventListener from '../Events/ProgramEventListener';
import VMEmulatorInstruction from './VMEmulatorInstruction';

/**
 * An interface for the GUI of the VM program. displays a list of instructions and
 * marks the current instruction.
 * Also displays the current program file/directory name and enables the selection of
 * a new file/directory. If a new file/directory is selected, the gui will notify its listeners
 * on the change.
 * This GUI should disable external inputs to the program itself.
 * The instruction codes constants can be found in Hack.VirtualMachine.HVMInstructionSet .
 */
// tslint:disable-next-line: interface-name
interface VMProgramGUI extends InteractiveComputerPartGUI {
  /**
   * Registers the given ProgramEventListener as a listener to this GUI.
   */
  addProgramListener(listener: ProgramEventListener): void;

  /**
   * Un-registers the given ProgramEventListener from being a listener to this GUI.
   */
  removeProgramListener(listener: ProgramEventListener): void;

  /**
   * Notifies all the ProgramEventListeners on a change in the program by creating
   * a ProgramEvent (with the new event type and program's file/directory name) and sending it
   * using the programChanged method to all the listeners.
   */
  notifyProgramListeners(eventType: number, programFileName: string): void;

  /**
   * Sets the contents of the gui with the first instructionsLength
   * instructions from the given array of instructions.
   */
  setContents(
    instructions: VMEmulatorInstruction[],
    instructionsLength: number,
  ): void;

  /**
   * Sets the current instruction with the given instruction index.
   */
  setCurrentInstruction(instructionIndex: number): void;

  /**
   * Displays the given message.
   */
  showMessage(message: string): void;

  /**
   * Hides the displayed message.
   */
  hideMessage(): void;

  /**
   * Displays a confirmation window asking the user permission to
   * use built-in vm functions
   */
  confirmBuiltInAccess(): boolean;

  /**
   * Displays a notification window with the given message.
   */
  notify(message: string): void;
}

export default VMProgramGUI;
