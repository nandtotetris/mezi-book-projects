import GenericVector from 'dismantle/Common/GenericVector';
import {
  BuiltInGateClass,
  DirtyGateListener,
  GateClass,
  HDLTokenizer,
  Node,
} from 'dismantle/Gates/internal';

/**
 * A chip instance.
 */
export default abstract class Gate {
  /**
   * The special "true" node.
   */
  public static TRUE_NODE: Node = new Node(-1);

  /**
   * The special "false" node.
   */
  public static FALSE_NODE: Node = new Node(0);

  /**
   * The special "clock" node.
   */
  public static CLOCK_NODE: Node = new Node();

  // the input pins
  public inputPins: Node[] = [];

  // the output pins
  public outputPins: Node[] = [];

  // the class of this gate
  /// the model that contains the gate's logic, it's parser, and so on
  public gateClass: GateClass = new BuiltInGateClass(
    'And', // gate's name
    new HDLTokenizer('And.hdl'), // gate's HDL, tokenized
    [], // input pin's info
    [], // output pin's info
  );

  // true if the inputs to this gate changed since the last re-computation.
  public isDirty: boolean = false;

  // A list of listeners to the isDirty property.
  private dirtyGateListeners: GenericVector<DirtyGateListener> | null = null;

  /**
   * Adds the given listener as a listener to the isDirty property.
   */
  public addDirtyGateListener(listener: DirtyGateListener): void {
    if (this.dirtyGateListeners === null) {
      this.dirtyGateListeners = new GenericVector();
    }
    this.dirtyGateListeners.add(listener);
  }

  /**
   * Removes the given listener from being a listener to the isDirty property.
   */
  public removeDirtyGateListener(listener: DirtyGateListener): void {
    if (this.dirtyGateListeners != null) {
      this.dirtyGateListeners.remove(listener);
    }
  }

  /**
   * Re-computes the values of all output pins according to the gate's functionality.
   */
  public abstract reCompute(): void;

  /**
   * Updates the internal state of a clocked gate according to the gate's functionality.
   * (outputs are not updated).
   */
  public abstract clockUp(): void;

  /**
   * Updates the outputs of the gate according to its internal state.
   */
  public abstract clockDown(): void;

  /**
   * Marks the gate as "dirty" - needs to be recomputed.
   */
  public setDirty(): void {
    this.isDirty = true;
    if (this.dirtyGateListeners != null) {
      for (let i: number = 0; i < this.dirtyGateListeners.size(); i++) {
        this.dirtyGateListeners.elementAt(i).gotDirty();
      }
    }
  }

  /**
   * Returns the GateClass of this gate.
   */
  public getGateClass(): GateClass {
    return this.gateClass;
  }

  /**
   * Returns the node according to the given node name (may be an input or an output).
   * If doesn't exist, returns null.
   */
  public getNode(name: string): Node {
    if (this.gateClass === null) {
      throw new Error(`Inside getNode, gateClass is null`);
    }
    const type: number = this.gateClass.getPinType(name);
    const index: number = this.gateClass.getPinNumber(name);
    let result: Node;
    switch (type) {
      case GateClass.INPUT_PIN_TYPE:
        result = this.inputPins[index];
        break;
      case GateClass.OUTPUT_PIN_TYPE:
        result = this.outputPins[index];
        break;
      default:
        throw new Error(`Inside getNode, unknown pin type: ${type}`);
    }
    return result;
  }

  /**
   * Returns the input pins.
   */
  public getInputNodes(): Node[] {
    return this.inputPins;
  }

  /**
   * Returns the output pins.
   */
  public getOutputNodes(): Node[] {
    return this.outputPins;
  }

  /**
   * Recomputes the gate's outputs if inputs changed since the last computation.
   */
  public eval(): void {
    if (this.isDirty) {
      this.doEval();
    }
  }

  /**
   * First computes the gate's output (from non-clocked information) and then updates
   * the internal state of the gate (which doesn't affect the outputs)
   */
  public tick(): void {
    this.doEval();
    this.clockUp();
  }

  /**
   * First updates the gate's outputs according to the internal state of the gate, and
   * then computes the outputs from non-clocked information.
   */
  public tock(): void {
    this.clockDown();
    this.doEval();
  }

  /**
   * Recomputes the gate's outputs.
   */
  private doEval(): void {
    if (this.isDirty) {
      this.isDirty = false;

      // notify listeners
      if (this.dirtyGateListeners != null) {
        for (let i: number = 0; i < this.dirtyGateListeners.size(); i++) {
          this.dirtyGateListeners.elementAt(i).gotClean();
        }
      }
    }
    this.reCompute();
  }
}
