import Vector from 'dismantle/Common/Vector';
import {
  BuiltInGateClass,
  DirtyGateListener,
  GateClass,
  HDLTokenizer,
  Node,
} from 'dismantle/Gates/internal';

export default abstract class Gate {
  public static TRUE_NODE: Node = new Node(-1);
  public static FALSE_NODE: Node = new Node(0);
  public static CLOCK_NODE: Node = new Node();
  public inputPins: Node[] = [];
  public outputPins: Node[] = [];
  public gateClass: GateClass = new BuiltInGateClass(
    'And',
    new HDLTokenizer('And.hdl'),
    [],
    [],
  );
  public isDirty: boolean = false;
  private dirtyGateListeners: Vector = new Vector();

  public addDirtyGateListener(listener: DirtyGateListener): void {
    if (this.dirtyGateListeners === null) {
      this.dirtyGateListeners = new Vector();
    }
    this.dirtyGateListeners.add(listener);
  }
  public removeDirtyGateListener(listener: DirtyGateListener): void {
    if (this.dirtyGateListeners != null) {
      this.dirtyGateListeners.remove(listener);
    }
  }
  public abstract reCompute(): void;
  public abstract clockUp(): void;
  public abstract clockDown(): void;
  public setDirty(): void {
    this.isDirty = true;
    if (this.dirtyGateListeners != null) {
      for (let i: number = 0; i < this.dirtyGateListeners.size(); i++) {
        (this.dirtyGateListeners.elementAt(i) as DirtyGateListener).gotDirty();
      }
    }
  }
  public getGateClass(): GateClass {
    return this.gateClass;
  }
  public getNode(name: string): Node {
    let result: Node = new Node();
    if (this.gateClass !== null) {
      const type: number = this.gateClass.getPinType(name);
      const index: number = this.gateClass.getPinNumber(name);
      switch (type) {
        case GateClass.INPUT_PIN_TYPE:
          result = this.inputPins[index];
          break;
        case GateClass.OUTPUT_PIN_TYPE:
          result = this.outputPins[index];
          break;
      }
    }
    return result;
  }
  public getInputNodes(): Node[] {
    return this.inputPins;
  }
  public getOutputNodes(): Node[] {
    return this.outputPins;
  }
  public eval(): void {
    if (this.isDirty) {
      this.doEval();
    }
  }
  public tick(): void {
    this.doEval();
    this.clockUp();
  }
  public tock(): void {
    this.clockDown();
    this.doEval();
  }
  private doEval(): void {
    if (this.isDirty) {
      this.isDirty = false;
      if (this.dirtyGateListeners != null) {
        for (let i: number = 0; i < this.dirtyGateListeners.size(); i++) {
          (this.dirtyGateListeners.elementAt(
            i,
          ) as DirtyGateListener).gotClean();
        }
      }
    }
    this.reCompute();
  }
}
