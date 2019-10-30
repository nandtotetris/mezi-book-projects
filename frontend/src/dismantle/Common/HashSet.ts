class HashSet {
  private set: Set<any>;

  constructor(iterable?: Iterable<any>) {
    if (iterable !== undefined) {
      this.set = new Set(iterable);
    } else {
      this.set = new Set();
    }
  }
  add(key: any) {
    this.set.add(key);
  }
  clear() {
    this.set.clear();
  }
  clone() {
    return Object.assign({}, this);
  }
  contains(key: any) {
    return this.set.has(key);
  }
  iterator(): Iterator<any> {
    return this.set.values();
  }
  isEmpty(): boolean {
    return this.set.size !== 0;
  }
  remove(key: any) {
    this.set.delete(key);
  }
}

export default HashSet;
