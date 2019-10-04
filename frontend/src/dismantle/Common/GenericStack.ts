class GenericStack<T> {
  private list: T[] = [];
  peek(): T {
    if (this.list.length < 1) {
      throw Error('Peeking into an empty stack');
    }
    return this.list[this.list.length - 1];
  }
  push(element: T) {
    this.list.push(element);
  }
  pop(): T {
    if (this.list.length < 1) {
      throw Error('Trying to pop from an empty stack');
    }
    const top: T = this.list[this.list.length - 1];
    this.list.pop();
    return top;
  }
  isEmpty(): boolean {
    return this.list.length === 0;
  }
}

export default GenericStack;
