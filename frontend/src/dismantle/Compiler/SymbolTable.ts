import GenericHashtable from 'dismantle/Common/GenericHashtable';
import {
  KW_FIELD_STR,
  KW_STATIC_STR,
  KW_VAR_STR,
} from 'dismantle/Compiler/JackTokenizer';

export const SUBROUTINE_STR = 'subroutine';
export const ARGUMENT_STR = 'argument';
export const NONE_STR = 'none';

export enum IDENTIFIER_KIND {
  STATIC,
  FIELD,
  ARG,
  VAR,
  NONE,
}

export function kindCodeToStr(code: IDENTIFIER_KIND): string {
  switch (code) {
    case IDENTIFIER_KIND.STATIC:
      return KW_STATIC_STR;
    case IDENTIFIER_KIND.FIELD:
      return KW_FIELD_STR;
    case IDENTIFIER_KIND.ARG:
      return ARGUMENT_STR;
    case IDENTIFIER_KIND.VAR:
      return KW_VAR_STR;
    case IDENTIFIER_KIND.NONE:
      return NONE_STR;
    default:
      throw new Error(
        `In method identifierCodeToStr, Unknown identifier code: ${code}.`,
      );
  }
}

export function kindStrToCode(identifier: string): IDENTIFIER_KIND {
  switch (identifier) {
    case KW_STATIC_STR:
      return IDENTIFIER_KIND.STATIC;
    case KW_FIELD_STR:
      return IDENTIFIER_KIND.FIELD;
    case ARGUMENT_STR:
      return IDENTIFIER_KIND.ARG;
    case KW_VAR_STR:
      return IDENTIFIER_KIND.VAR;
    case NONE_STR:
      return IDENTIFIER_KIND.NONE;
    default:
      return IDENTIFIER_KIND.NONE;
  }
}

export interface IdentifierInfo {
  kind: IDENTIFIER_KIND;
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
   * @param kind is the identifier STATIC, FIELD, ARG, or VAR
   */
  public define(name: string, type: any, kind: IDENTIFIER_KIND) {
    this.incrementVarCount(kind);
    const identiferInfo: IdentifierInfo = {
      index: this.varCount(kind),
      kind,
      type,
    };
    if (kind === IDENTIFIER_KIND.STATIC || kind === IDENTIFIER_KIND.FIELD) {
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
  public kindOf(name: string): IDENTIFIER_KIND {
    if (this.subroutineTable.get(name) !== undefined) {
      return this.subroutineTable.get(name).kind;
    }
    if (this.classTable.get(name) !== undefined) {
      return this.classTable.get(name).kind;
    }
    return IDENTIFIER_KIND.NONE;
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
  public varCount(kind: IDENTIFIER_KIND): number {
    switch (kind) {
      case IDENTIFIER_KIND.STATIC:
        return this.staticsCount;
      case IDENTIFIER_KIND.FIELD:
        return this.fieldsCount;
      case IDENTIFIER_KIND.ARG:
        return this.argsCount;
      case IDENTIFIER_KIND.VAR:
        return this.varsCount;
    }
    return 0;
  }

  private incrementVarCount(kind: IDENTIFIER_KIND) {
    switch (kind) {
      case IDENTIFIER_KIND.STATIC:
        this.staticsCount++;
        break;
      case IDENTIFIER_KIND.FIELD:
        this.fieldsCount++;
        break;
      case IDENTIFIER_KIND.ARG:
        this.argsCount++;
        break;
      case IDENTIFIER_KIND.VAR:
        this.varsCount++;
        break;
    }
    return 0;
  }
}

export default SymbolTable;
