import GenericVector from 'dismantle/Common/GenericVector';
import { Node } from 'dismantle/Gates/internal';

/**
 * A set of nodes.
 */
export default class NodeSet extends GenericVector<Node> {
  /**
   * Returns the Node at the given index.
   * (Assumes a legal index).
   */
  getNodeAt(index: number): Node {
    return super.elementAt(index);
  }
}
