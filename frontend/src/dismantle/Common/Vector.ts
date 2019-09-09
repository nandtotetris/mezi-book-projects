class Vector {
  private list: any[] = [];
  addElement(element: any) {
    this.list.push(element);
  }
  add(element: any) {
    this.list.push(element);
  }
  remove(element: any) {
    const index: number = this.list.indexOf(element);
    this.list.splice(index, 1);
  }
  elementAt(i: number): any {
    return this.list[i];
  }
  size(): number {
    return this.list.length;
  }
}

export default Vector;
