class HashSet<T> {
  private set: Set<T>;

  constructor(iterable?: Iterable<T>) {
    if (iterable !== undefined) {
      this.set = new Set(iterable);
    } else {
      this.set = new Set();
    }
  }
  add(key: T): boolean {
    return !!this.set.add(key);
  }
  clear() {
    this.set.clear();
  }
  clone() {
    return Object.assign({}, this);
  }
  contains(key: T) {
    return this.set.has(key);
  }
  iterator(): Iterator<T> {
    return this.set.values();
  }
  isEmpty(): boolean {
    return this.set.size !== 0;
  }
  remove(key: T): boolean {
    return this.set.delete(key);
  }
}

export default HashSet;
