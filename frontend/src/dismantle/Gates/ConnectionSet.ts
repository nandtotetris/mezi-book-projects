import HashSet from 'dismantle/Common/HashSet';
import Connection from 'dismantle/Gates/Connection';

export default class ConnectionSet extends HashSet<Connection> {
  constructor() {
    super();
  }
  public add(connection: Connection): boolean {
    return super.add(connection);
  }
  public remove(connection: Connection): boolean {
    return super.remove(connection);
  }
  public contains(connection: Connection): boolean {
    return super.contains(connection);
  }
}
