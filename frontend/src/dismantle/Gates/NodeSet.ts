import { Node } from 'dismantle/Gates/internal';

/**
 * A set of nodes.
 */
class NodeSet {
  private list: Node[];
  /**
   * Creates a new NodeSet.
   */
  constructor() {
    this.list = [];
  }

  /**
   * return length of NodeSet
   */
  size(): number {
    return this.list.length;
  }

  /**
   * Adds the given node to the set.
   */
  add(node: Node): boolean {
    this.list.push(node);
    return true;
  }

  /**
   * Removes the given node from the set.
   */
  remove(node: Node): boolean {
    const index = this.list.indexOf(node);
    if (index !== -1) {
      this.list.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Returns true if this set contains the given node.
   */
  contains(node: Node): boolean {
    return this.list.indexOf(node) !== -1;
  }

  /**
   * Returns the Node at the given index.
   * (Assumes a legal index).
   */
  getNodeAt(index: number): Node {
    if (index > this.list.length) {
      throw Error(
        `In method getNodeAt: given index ${index} is greater than size`,
      );
    }
    return this.list[index];
  }
}

export default NodeSet;
