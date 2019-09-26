import GenericHashtable from 'dismantle/Common/GenericHashtable';

export enum IDENTIFIER_TYPE {
  STATIC,
  FIELD,
  ARG,
  VAR,
  NONE,
}

export interface IdentifierInfo {
  kind: IDENTIFIER_TYPE;
  index: number;
  type: string;
}

class SymbolTable {
  private classTable: GenericHashtable<string, IdentifierInfo>;
  private subroutineTable: GenericHashtable<string, IdentifierInfo>;

  private staticsCount: number = 0;
  private fieldsCount: number = 0;
  private argsCount: number = 0;
  private varsCount: number = 0;

  /**
   * Creates a new empty symbol table
   */
  public constructor() {
    this.classTable = new GenericHashtable<string, IdentifierInfo>();
    this.subroutineTable = new GenericHashtable<string, IdentifierInfo>();
  }

  /**
   * Starts a new subroutine scope (i.e resets the subroutine's symbol table)
   */
  public startSubroutine() {
    this.subroutineTable = new GenericHashtable<string, IdentifierInfo>();
  }

  /**
   * Defines a new identifier of a given name, type, and kind
   * and assigns it a running index. STATIC and FIELD
   * identifiers have a class scope, while ARG and VAR
   * identifiers have a subroutine scope.
   * @param name identifer name
   * @param type the type of identifier (primitive, or user defined)
   * @param kind is the identifier STATIC, FIELD, ARV, or VAR
   */
  public define(name: string, type: any, kind: IDENTIFIER_TYPE) {
    this.incrementVarCount(kind);
    const identiferInfo: IdentifierInfo = {
      index: this.varCount(kind),
      kind,
      type,
    };
    if (kind === IDENTIFIER_TYPE.STATIC || kind === IDENTIFIER_TYPE.FIELD) {
      this.classTable.put(name, identiferInfo);
    } else {
      this.subroutineTable.put(name, identiferInfo);
    }
  }

  /**
   * Returns the kind of the named identifier in the current
   * scope. If the identifier is unknown in the current
   * scope, returns NONE.
   * @param name the name of the variable
   */
  public kindOf(name: string): IDENTIFIER_TYPE {
    if (this.subroutineTable.get(name) !== undefined) {
      return this.subroutineTable.get(name).kind;
    }
    if (this.classTable.get(name) !== undefined) {
      return this.classTable.get(name).kind;
    }
    return IDENTIFIER_TYPE.NONE;
  }

  /**
   * Returns the type of the named identifier in the current
   * scope.
   * @param name the name of the variable
   */
  public typeOf(name: string): string {
    if (this.subroutineTable.get(name) !== undefined) {
      return this.subroutineTable.get(name).type;
    }
    if (this.classTable.get(name) !== undefined) {
      return this.classTable.get(name).type;
    }
    return '';
  }

  /**
   * Returns the type of the named identifier in the current
   * scope.
   * @param name the name of the variable
   */
  public indexOf(name: string): number {
    if (this.subroutineTable.get(name) !== undefined) {
      return this.subroutineTable.get(name).index;
    }
    if (this.classTable.get(name) !== undefined) {
      return this.classTable.get(name).index;
    }
    return 0;
  }

  /**
   * Returns the number of variables of the given kind
   * already defiend in the current scope
   * @param kind the kind of the variable (STATIC, FILED, ARG, VAR)
   */
  public varCount(kind: IDENTIFIER_TYPE): number {
    switch (kind) {
      case IDENTIFIER_TYPE.STATIC:
        return this.staticsCount;
      case IDENTIFIER_TYPE.FIELD:
        return this.fieldsCount;
      case IDENTIFIER_TYPE.ARG:
        return this.argsCount;
      case IDENTIFIER_TYPE.VAR:
        return this.varsCount;
    }
    return 0;
  }

  private incrementVarCount(kind: IDENTIFIER_TYPE) {
    switch (kind) {
      case IDENTIFIER_TYPE.STATIC:
        this.staticsCount++;
        break;
      case IDENTIFIER_TYPE.FIELD:
        this.fieldsCount++;
        break;
      case IDENTIFIER_TYPE.ARG:
        this.argsCount++;
        break;
      case IDENTIFIER_TYPE.VAR:
        this.varsCount++;
        break;
    }
    return 0;
  }
}

export default SymbolTable;
