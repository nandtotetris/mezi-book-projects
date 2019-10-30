/**
 * An interface for the GUI of the GatesPanel. GUIs of the vairous gates are added to
 * this panel.
 */
// tslint:disable-next-line: interface-name
export default interface GatesPanelGUI {
  /**
   * Adds the given gate component to the gates panel.
   * gateComponent is of type Component (java's swing component)
   */
  addGateComponent(gateComponent: any): void;

  /**
   * Removes the given gate component from the gates panel.
   */
  removeGateComponent(gateComponent: any): void;

  /**
   * Removes all the gate components from the gates panel.
   */
  removeAllGateComponents(): void;
}
