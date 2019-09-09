class EventObject {
  protected source: object;

  constructor(source: object) {
    if (source === undefined) {
      throw new Error('undefined source');
    } else {
      this.source = source;
    }
  }

  public getSource(): object {
    return this.source;
  }

  public toString(): string {
    return '[source=' + this.source + ']';
  }
}

export default EventObject;
