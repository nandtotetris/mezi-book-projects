class GenericHashtable<K, V> {
  private table: any = {};
  get(key: K): V {
    return this.table[key];
  }
  setTable(table: any) {
    this.table = table;
  }
  getTable(): any {
    return { ...this.table };
  }
  put(key: K, value: V) {
    this.table[key] = value;
  }
  clear() {
    this.table = {};
  }
  clone() {
    return Object.assign({}, this);
  }
  containsKey(key: K) {
    return this.table[key] !== undefined;
  }
}

export default GenericHashtable;
