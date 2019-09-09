class Hashtable {
  private table: any = {};
  get(key: any): any {
    return this.table[key];
  }
  setTable(table: any) {
    this.table = table;
  }
  getTable(): any {
    return { ...this.table };
  }
  put(key: any, value: any) {
    this.table[key] = value;
  }
  clear() {
    this.table = {};
  }
  clone() {
    return Object.assign({}, this);
  }
  containsKey(key: any) {
    return this.table[key] !== undefined;
  }
}

export default Hashtable;
