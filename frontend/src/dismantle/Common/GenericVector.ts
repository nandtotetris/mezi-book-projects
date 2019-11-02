export default class GenericVector<T> {
  private list: T[];
  constructor() {
    this.list = new Array<T>();
  }
  addElement(element: T) {
    this.list.push(element);
  }
  add(element: T) {
    this.list.push(element);
  }
  remove(element: T) {
    const index: number = this.list.indexOf(element);
    this.list.splice(index, 1);
  }
  removeElement(element: T) {
    this.remove(element);
  }
  removeAllElements() {
    this.list = [];
  }
  elementAt(i: number): T {
    return this.list[i];
  }
  toArray(array: T[]): T[] {
    array.push(...this.list);
    return array;
  }
  size(): number {
    return this.list.length;
  }
  contains(element: T): boolean {
    return this.list.indexOf(element) !== -1;
  }
}
