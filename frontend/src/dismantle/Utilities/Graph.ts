import HashMap from 'dismantle/Common/HashMap';
import HashSet from 'dismantle/Common/HashSet';
import Vector from 'dismantle/Common/Vector';

export default class Graph<T> {
  private graph: HashMap<T, HashSet<T>>;
  private hasACircle: boolean = false;

  constructor() {
    this.graph = new HashMap();
  }

  public addEdge(source: T, target: T): void {
    this.checkExistence(source);
    this.checkExistence(target);
    const edgeSet: HashSet<T> | undefined = this.graph.get(source);
    if (edgeSet !== undefined) {
      edgeSet.add(target);
    } else {
      throw new Error(
        `In method addEdge of Graph, source ${source} not in graph`,
      );
    }
  }

  public isEmpty(): boolean {
    return this.graph.keySet().isEmpty();
  }

  public pathExists(source: T, destination: T): boolean {
    const marked: HashSet<T> = new HashSet();
    return this.doPathExists(source, destination, marked);
  }

  public topologicalSort(start: T): T[] {
    this.hasACircle = false;
    const marked: HashSet<T> = new HashSet();
    const processed: HashSet<T> = new HashSet();
    const nodes: Vector = new Vector();
    this.doTopologicalSort(start, nodes, marked, processed);
    const result: T[] = new Array<T>(nodes.size());
    for (let i: number = 0; i < result.length; i++) {
      result[i] = nodes.elementAt(result.length - i - 1);
    }
    return result;
  }

  public hasCircle(): boolean {
    return this.hasACircle;
  }

  private checkExistence(object: T): void {
    if (!this.graph.keySet().contains(object)) {
      const edgeSet: HashSet<T> = new HashSet();
      this.graph.put(object, edgeSet);
    }
  }

  private doPathExists(source: T, destination: T, marked: HashSet<T>): boolean {
    let pathFound: boolean = false;
    marked.add(source);
    const edgeSet: HashSet<T> | undefined = this.graph.get(source);
    if (edgeSet !== undefined) {
      const edgeIter: Iterator<T> = edgeSet.iterator();
      while (edgeIter.next() && !pathFound) {
        const currentNode: T = edgeIter.next().value;
        pathFound = currentNode === destination;
        if (!pathFound && !marked.contains(currentNode)) {
          pathFound = this.doPathExists(currentNode, destination, marked);
        }
      }
    }
    return pathFound;
  }

  private doTopologicalSort(
    node: T,
    nodes: Vector,
    marked: HashSet<T>,
    processed: HashSet<T>,
  ): void {
    marked.add(node);
    processed.add(node);
    const edgeSet: HashSet<T> | undefined = this.graph.get(node);
    if (edgeSet !== undefined) {
      const edgeIter: Iterator<T> = edgeSet.iterator();
      while (edgeIter.next()) {
        const currentNode: T = edgeIter.next().value;
        if (processed.contains(currentNode)) {
          this.hasACircle = true;
        }
        if (!marked.contains(currentNode)) {
          this.doTopologicalSort(currentNode, nodes, marked, processed);
        }
      }
    }
    processed.remove(node);
    nodes.addElement(node);
  }
}
