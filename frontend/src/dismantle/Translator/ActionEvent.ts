import EventObject from './EventObject';

class ActionEvent extends EventObject {
  private actionCommand: string;
  constructor(source: object, command: string) {
    super(source);
    this.actionCommand = command;
  }
  public getActionCommand(): string {
    return this.actionCommand;
  }
}

export default ActionEvent;
