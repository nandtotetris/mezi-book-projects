import { NodeSet } from 'dismantle/Gates/internal';
/**
 * A node - a wire (or a complete bus) in a circuit.
 */
export default class Node {
  // the value of the node
  protected value: number;

  // listeners list
  protected listeners: NodeSet | null = null;

  /**
   * Constructs a new Node with the given initial value.
   */
  constructor(initialValue?: number) {
    this.value = initialValue || 0;
  }

  /**
   * Adds the given node as a listener.
   */
  public addListener(node: Node) {
    if (this.listeners === null) {
      this.listeners = new NodeSet();
    }
    this.listeners.add(node);
  }

  /**
   * Removes the given node from being a listener.
   */
  public removeListener(node: Node) {
    if (this.listeners !== null) {
      this.listeners.remove(node);
    }
  }

  /**
   * Returns the value of this node.
   */
  public get(): number {
    return this.value;
  }

  /**
   * Sets the node's value with the given value.
   * Notifies the listeners on the change by calling their set() method.
   */
  public set(value: number) {
    if (this.value !== value) {
      this.value = value;

      if (this.listeners !== null) {
        for (let i = 0; i < this.listeners.size(); i++) {
          this.listeners.getNodeAt(i).set(this.get());
        }
      }
    }
  }
}
