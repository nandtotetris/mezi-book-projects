import HashMap from 'dismantle/Common/HashMap';
import HashSet from 'dismantle/Common/HashSet';
import Vector from 'dismantle/Common/Vector';

export default class Graph {
  private graph: HashMap<any, HashSet>;
  private hasACircle: boolean = false;

  constructor() {
    this.graph = new HashMap();
  }

  public addEdge(source: any, target: any): void {
    this.checkExistence(source);
    this.checkExistence(target);
    const edgeSet: HashSet | undefined = this.graph.get(source);
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

  public pathExists(source: any, destination: any): boolean {
    const marked: HashSet = new HashSet();
    return this.doPathExists(source, destination, marked);
  }

  public topologicalSort(start: any): any[] {
    this.hasACircle = false;
    const marked: HashSet = new HashSet();
    const processed: HashSet = new HashSet();
    const nodes: Vector = new Vector();
    this.doTopologicalSort(start, nodes, marked, processed);
    const result: any[] = new Array<any>(nodes.size());
    for (let i: number = 0; i < result.length; i++) {
      result[i] = nodes.elementAt(result.length - i - 1);
    }
    return result;
  }

  public hasCircle(): boolean {
    return this.hasACircle;
  }

  private checkExistence(object: any): void {
    if (!this.graph.keySet().contains(object)) {
      const edgeSet: HashSet = new HashSet();
      this.graph.put(object, edgeSet);
    }
  }

  private doPathExists(
    source: any,
    destination: any,
    marked: HashSet,
  ): boolean {
    let pathFound: boolean = false;
    marked.add(source);
    const edgeSet: HashSet | undefined = this.graph.get(source);
    if (edgeSet !== undefined) {
      const edgeIter: Iterator<any> = edgeSet.iterator();
      while (edgeIter.next() && !pathFound) {
        const currentNode: any = edgeIter.next();
        pathFound = currentNode.equals(destination);
        if (!pathFound && !marked.contains(currentNode)) {
          pathFound = this.doPathExists(currentNode, destination, marked);
        }
      }
    }
    return pathFound;
  }

  private doTopologicalSort(
    node: any,
    nodes: Vector,
    marked: HashSet,
    processed: HashSet,
  ): void {
    marked.add(node);
    processed.add(node);
    const edgeSet: HashSet | undefined = this.graph.get(node);
    if (edgeSet !== undefined) {
      const edgeIter: Iterator<any> = edgeSet.iterator();
      while (edgeIter.next()) {
        const currentNode: any = edgeIter.next();
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
