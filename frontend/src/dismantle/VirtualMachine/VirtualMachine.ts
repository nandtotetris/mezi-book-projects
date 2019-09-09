/**
 * A Virtual Machine interface. provides an interface for compiling
 * byte code to machine language - every implementation should
 * produce the proper commands for it's architectue.
 * It has 4 types of operations:
 * 1 - Arithmetic commands
 * 2 - Memory access commands
 * 3 - Program flow
 * 4 - Function calls
 */
// tslint:disable-next-line: interface-name
interface VirtualMachine {
  // ----  The Arithmetic commands ---//
  // Each operation pops it's argument from the stack and pushes
  // the result back to the stack

  /**
   * integer addition (binary operation).
   */
  add(): void;

  /**
   * 2's complement integer substraction (binary operation)
   */
  substract(): void;

  /**
   * 2's complement negation (unary operation)
   */
  negate(): void;

  /**
   * Equalaty operation (binary operation). Returns(to the stack)
   * 0xFFFF as true,0x000 as false
   */
  equal(): void;

  /**
   * Greater than operation (binary operation). Returns(to the stack)
   * 0xFFFF as true,0x0000 as false
   */
  greaterThan(): void;

  /**
   * Less than operation (binary operation). Returns(to the stack)
   * 0xFFFF as true,0x0000 as false
   */
  lessThan(): void;

  /**
   * Bit wise "AND" (binary operation).
   */
  and(): void;

  /**
   * Bit wise "OR" (binary operation).
   */
  or(): void;

  /**
   * Bit wise "NOT" (unary operation).
   */
  not(): void;

  // ----  Memory access commands ---//

  /**
   * Pushes the value of the given segment in the given entry to the stack
   */
  push(segment: string, entry: number): void;

  /**
   * Pops an item from the stack into the given segment in the given entry
   */
  pop(segment: string, entry: number): void;

  // ----  Program flow commands ---//

  /**
   * Labels the current location in the function code. Only labeled location
   * can be jumped to from other parts of the function.
   * The label - l is 8 bits and is local to the function
   */
  label(l: string): void;

  /**
   * Goes to the label l
   * The label - l is 8 bits and is local to the function
   */
  goTo(l: string): void;

  /**
   * Pops a value from the stack and goes to the label l if the value
   * is not zero.
   * The label - l is 8 bits and is local to the function
   */
  ifGoTo(l: string): void;

  // ----  Function calls commands ---//

  /**
   * Here Starts the code of a function according to the given function name
   * that has the given number of local variables.
   * @param functionName The function name
   * @param numberOfLocals The number of local variables
   */
  function(functionName: string, numberOfLocals: number): void;

  /**
   * Returns the value of the function to the top of the stack.
   */
  returnFromFunction(): void;

  /**
   * Calls a function according to the given function number stating
   * that the given number of arguments have been pushed onto the stack
   * @param functionName The function name
   * @param numberOfArguments The number of arguments of the function
   */
  callFunction(functionName: string, numberOfArguments: number): void;
}

export default VirtualMachine;
