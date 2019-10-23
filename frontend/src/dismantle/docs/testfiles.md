const sampleHdlInput = `
// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/05/CPU.hdl

/**
 * The Hack CPU (Central Processing unit), consisting of an ALU,
 * two registers named A and D, and a program counter named PC.
 * The CPU is designed to fetch and execute instructions written in
 * the Hack machine language. In particular, functions as follows:
 * Executes the inputted instruction according to the Hack machine
 * language specification. The D and A in the language specification
 * refer to CPU-resident registers, while M refers to the external
 * memory location addressed by A, i.e. to Memory[A]. The inM input
 * holds the value of this location. If the current instruction needs
 * to write a value to M, the value is placed in outM, the address
 * of the target location is placed in the addressM output, and the
 * writeM control bit is asserted. (When writeM==0, any value may
 * appear in outM). The outM and writeM outputs are combinational:
 * they are affected instantaneously by the execution of the current
 * instruction. The addressM and pc outputs are clocked: although they
 * are affected by the execution of the current instruction, they commit
 * to their new values only in the next time step. If reset==1 then the
 * CPU jumps to address 0 (i.e. pc is set to 0 in next time step) rather
 * than to the address resulting from executing the current instruction.
 */

CHIP CPU {

    IN  inM[16],         // M value input  (M = contents of RAM[A])
        instruction[16], // Instruction for execution
        reset;           // Signals whether to re-start the current
                         // program (reset==1) or continue executing
                         // the current program (reset==0).

    OUT outM[16],        // M value output
        writeM,          // Write to M?
        addressM[15],    // Address in data memory (of M)
        pc[15];          // address of next instruction

    PARTS:
    // A register
    Mux16(a[15]=false, a[0..14]=instruction[0..14], b=aluOut, sel=instruction[15], out=regAVal);
    Not(in=instruction[15], out=isAInstr);
    And(a=instruction[15], b=instruction[5], out=isADestn);
    Or(a=isAInstr, b=isADestn, out=loadA);
    ARegister(in=regAVal, load=loadA, out=outAReg);
    // D register
    And(a=instruction[15], b=instruction[4], out=loadD); /* this is inline comment */
    DRegister(in=aluOut, load=loadD, out=outDReg);
    // Memory out
    And(a=instruction[15], b=instruction[3], out=writeM);
    And16(a=aluOut, b=aluOut, out=outM);
    And16(a=outAReg, b=outAReg, out[0..14]=addressM);
    // ALU
    Mux16(a=outAReg, b=inM, sel=instruction[12], out=aluY);
    ALU(x=outDReg, y=aluY, zx=instruction[11], nx=instruction[10], zy=instruction[9], ny=instruction[8], f=instruction[7], no=instruction[6], out=aluOut, zr=zr, ng=ng);
    // PC register
    Or(a=instruction[0], b=instruction[1], out=instruction01);
    Or(a=instruction[2], b=instruction01, out=conditionSet);
    And(a=instruction[15], b=conditionMet, out=isJump);
    Or(a=ng, b=zr, out=ngzr);
    Not(in=ngzr, out=gt);
    And(a=instruction[0], b=gt, out=j3Match);
    And(a=instruction[1], b=zr, out=j2Match);
    And(a=instruction[2], b=ng, out=j1Match);
    Or(a=j3Match, b=j2Match, out=j23Match);
    Or(a=j1Match, b=j23Match, out=conditionMet);
    And(a=isJump, b=conditionMet, out=loadPc);
    Or(a=loadPc, b=reset, out=loadOrReset);
    Not(in=loadOrReset, out=increment);
    PC(in=outAReg, load=loadPc, inc=increment, reset=reset, out[0..14]=pc);
}
  `;

const SimpleAdd = `
  // This file is part of www.nand2tetris.org 
  // and the book "The Elements of Computing Systems"
  // by Nisan and Schocken, MIT Press.
  // File name: projects/07/StackArithmetic/SimpleAdd/SimpleAdd.vm
  
  // Pushes and adds two constants.
  push constant 7
  push constant 8
  add  
  `;

const BasicTest = `
// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/07/MemoryAccess/BasicTest/BasicTest.vm

// Executes pop & push commands using the virtual memory segments.
push constant 10
pop local 0
push constant 21
push constant 22
pop argument 2
pop argument 1
push constant 36
pop this 6
push constant 42
push constant 45
pop that 5
pop that 2
push constant 510
pop temp 6
push local 0
push that 5
add
push argument 1
sub
push this 6
push this 6
add
sub
push temp 6
add
`;

const PointerTest = `
// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/07/MemoryAccess/PointerTest/PointerTest.vm

// Executes pop and push commands using the 
// pointer, this, and that segments.
push constant 3030
pop pointer 0
push constant 3040
pop pointer 1
push constant 32
pop this 2
push constant 46
pop that 6
push pointer 0
push pointer 1
add
push this 2
sub
push that 6
add
`;

const StaticTest = `
// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/07/MemoryAccess/StaticTest/StaticTest.vm

// Executes pop and push commands using the static segment.
push constant 111
push constant 333
push constant 888
pop static 8
pop static 3
pop static 1
push static 3
push static 1
sub
push static 8
add
`;

const StackTest = `
// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/07/StackArithmetic/StackTest/StackTest.vm

// Executes a sequence of arithmetic and logical operations
// on the stack. 
push constant 17
push constant 17
eq
push constant 17
push constant 16
eq
push constant 16
push constant 17
eq
push constant 892
push constant 891
lt
push constant 891
push constant 892
lt
push constant 891
push constant 891
lt
push constant 32767
push constant 32766
gt
push constant 32766
push constant 32767
gt
push constant 32766
push constant 32766
gt
push constant 57
push constant 31
push constant 53
add
push constant 112
sub
neg
and
push constant 82
or
not
`;

const Main = `
// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/08/FunctionCalls/FibonacciElement/Main.vm

// Computes the n'th element of the Fibonacci series, recursively.
// n is given in argument[0].  Called by the Sys.init function 
// (part of the Sys.vm file), which also pushes the argument[0] 
// parameter before this code starts running.

function Main.fibonacci 0
push argument 0
push constant 2
lt                     // check if n < 2
if-goto IF_TRUE
goto IF_FALSE
label IF_TRUE          // if n<2, return n
push argument 0        
return
label IF_FALSE         // if n>=2, return fib(n-2)+fib(n-1)
push argument 0
push constant 2
sub
call Main.fibonacci 1  // compute fib(n-2)
push argument 0
push constant 1
sub
call Main.fibonacci 1  // compute fib(n-1)
add                    // return fib(n-1) + fib(n-2)
return
`;

const FibonacciSys = `
// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/08/FunctionCalls/FibonacciElement/Sys.vm

// Pushes n onto the stack and calls the Main.fibonacii function,
// which computes the n'th element of the Fibonacci series.
// The Sys.init function is called "automatically" by the 
// bootstrap code.

function Sys.init 0
push constant 4
call Main.fibonacci 1   // Compute the 4'th fibonacci element
label WHILE
goto WHILE              // Loop infinitely
`;

const Class1 = `
// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/08/FunctionCalls/StaticsTest/Class1.vm

// Stores two supplied arguments in static[0] and static[1].
function Class1.set 0
push argument 0
pop static 0
push argument 1
pop static 1
push constant 0
return

// Returns static[0] - static[1].
function Class1.get 0
push static 0
push static 1
sub
return
`;

const Class2 = `
// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/08/FunctionCalls/StaticsTest/Class2.vm

// Stores two supplied arguments in static[0] and static[1].
function Class2.set 0
push argument 0
pop static 0
push argument 1
pop static 1
push constant 0
return

// Returns static[0] - static[1].
function Class2.get 0
push static 0
push static 1
sub
return
`;

const StaticSys = `
// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/08/FunctionCalls/StaticsTest/Sys.vm

// Tests that different functions, stored in two different 
// class files, manipulate the static segment correctly. 
function Sys.init 0
push constant 6
push constant 8
call Class1.set 2
pop temp 0 // Dumps the return value
push constant 23
push constant 15
call Class2.set 2
pop temp 0 // Dumps the return value
call Class1.get 0
call Class2.get 0
label WHILE
goto WHILE
`;

const SimpleFunction = `
// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/08/FunctionCalls/SimpleFunction/SimpleFunction.vm

// Performs a simple calculation and returns the result.
function SimpleFunction.test 2
push local 0
push local 1
add
not
push argument 0
add
push argument 1
sub
return
`;

const BasicLoop = `
// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/08/ProgramFlow/BasicLoop/BasicLoop.vm

// Computes the sum 1 + 2 + ... + argument[0] and pushes the 
// result onto the stack. Argument[0] is initialized by the test 
// script before this code starts running.
push constant 0    
pop local 0        // initialize sum = 0
label LOOP_START
push argument 0    
push local 0
add
pop local 0	   // sum = sum + counter
push argument 0
push constant 1
sub
pop argument 0     // counter--
push argument 0
if-goto LOOP_START // If counter > 0, goto LOOP_START
push local 0
`;

const FibonacciSeries = `
// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/08/ProgramFlow/FibonacciSeries/FibonacciSeries.vm

// Puts the first argument[0] elements of the Fibonacci series
// in the memory, starting in the address given in argument[1].
// Argument[0] and argument[1] are initialized by the test script 
// before this code starts running.

push argument 1
pop pointer 1           // that = argument[1]

push constant 0
pop that 0              // first element = 0
push constant 1
pop that 1              // second element = 1

push argument 0
push constant 2
sub
pop argument 0          // num_of_elements -= 2 (first 2 elements are set)

label MAIN_LOOP_START

push argument 0
if-goto COMPUTE_ELEMENT // if num_of_elements > 0, goto COMPUTE_ELEMENT
goto END_PROGRAM        // otherwise, goto END_PROGRAM

label COMPUTE_ELEMENT

push that 0
push that 1
add
pop that 2              // that[2] = that[0] + that[1]

push pointer 1
push constant 1
add
pop pointer 1           // that += 1

push argument 0
push constant 1
sub
pop argument 0          // num_of_elements--

goto MAIN_LOOP_START

label END_PROGRAM
`;

const Nested = `
// Sys.vm for NestedCall test.
//
// Copyright (C) 2013 Mark A. Armbrust.
// Permission granted for educational use.

// Sys.init() calls Sys.main(), stores the return value in temp 1,
//  and enters an infinite loop.

function Sys.init 0
call Sys.main 0
pop temp 1
label LOOP
goto LOOP

// Sys.main() calls Sys.add12(123) and stores return value (135) in temp 0.
// Returns 456.

function Sys.main 0
push constant 123
call Sys.add12 1
pop temp 0
push constant 246
return

// Sys.add12(int x) returns x+12.
// It allocates 3 words of local storage to test the deallocation of local
// storage during the return.

function Sys.add12 3
push argument 0
push constant 12
add
return
`;

const SquareMainJack: string = `
// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/09/Square/Main.jack

/**
 * The Main class initializes a new Square Dance game and starts it.
 */
class Main {

    /** Initializes a new game and starts it. */    
    function void main() {
        var SquareGame game;

        let game = SquareGame.new();
        do game.run();
		do game.dispose();

        return;
    }
}
`;

const SquareJack: string = `
// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/09/Square/Square.jack

/**
 * Implements a graphic square. A graphic square has a screen location
 * and a size. It also has methods for drawing, erasing, moving on the 
 * screen, and changing its size.
 */
class Square {

    // Location on the screen
    field int x, y;

    // The size of the square
    field int size;

    /** Constructs a new square with a given location and size. */
    constructor Square new(int Ax, int Ay, int Asize) {
        let x = Ax;
        let y = Ay;
        let size = Asize;

        do draw();

        return this;
    }

    /** Deallocates the object's memory. */
    method void dispose() {
        do Memory.deAlloc(this);
        return;
    }

    /** Draws the square on the screen. */
    method void draw() {
        do Screen.setColor(true);
        do Screen.drawRectangle(x, y, x + size, y + size);
        return;
    }

    /** Erases the square from the screen. */
    method void erase() {
        do Screen.setColor(false);
        do Screen.drawRectangle(x, y, x + size, y + size);
        return;
    }

    /** Increments the size by 2 pixels. */
    method void incSize() {
        if (((y + size) < 254) & ((x + size) < 510)) {
            do erase();
            let size = size + 2;
            do draw();
        }
        return;
    }

    /** Decrements the size by 2 pixels. */
    method void decSize() {
        if (size > 2) {
            do erase();
            let size = size - 2;
            do draw();
        }
        return;
	}

    /** Moves up by 2 pixels. */
    method void moveUp() {
        if (y > 1) {
            do Screen.setColor(false);
            do Screen.drawRectangle(x, (y + size) - 1, x + size, y + size);
            let y = y - 2;
            do Screen.setColor(true);
            do Screen.drawRectangle(x, y, x + size, y + 1);
        }
        return;
    }

    /** Moves down by 2 pixels. */
    method void moveDown() {
        if ((y + size) < 254) {
            do Screen.setColor(false);
            do Screen.drawRectangle(x, y, x + size, y + 1);
            let y = y + 2;
            do Screen.setColor(true);
            do Screen.drawRectangle(x, (y + size) - 1, x + size, y + size);
        }
        return;
    }

    /** Moves left by 2 pixels. */
    method void moveLeft() {
        if (x > 1) {
            do Screen.setColor(false);
            do Screen.drawRectangle((x + size) - 1, y, x + size, y + size);
            let x = x - 2;
            do Screen.setColor(true);
            do Screen.drawRectangle(x, y, x + 1, y + size);
        }
        return;
    }

    /** Moves right by 2 pixels. */
    method void moveRight() {
        if ((x + size) < 510) {
            do Screen.setColor(false);
            do Screen.drawRectangle(x, y, x + 1, y + size);
            let x = x + 2;
            do Screen.setColor(true);
            do Screen.drawRectangle((x + size) - 1, y, x + size, y + size);
        }
        return;
    }
}
`;

const SquareGameJack: string = `
// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/09/Square/SquareGame.jack

/**
 * Implements the Square Dance game.
 * In this game you can move a black square around the screen and
 * change its size during the movement.
 * In the beginning, the square is located at the top-left corner
 * of the screen. The arrow keys are used to move the square.
 * The 'z' & 'x' keys are used to decrement and increment the size.
 * The 'q' key is used to quit the game.
 */
class SquareGame {

    // The square
    field Square square;

    // The square's movement direction
    field int direction; // 0=none,1=up,2=down,3=left,4=right

    /** Constructs a new Square Game. */
    constructor SquareGame new() {
        let square = Square.new(0, 0, 30);
        let direction = 0;

        return this;
    }

    /** Deallocates the object's memory. */
    method void dispose() {
        do square.dispose();
        do Memory.deAlloc(this);
        return;
    }

    /** Starts the game. Handles inputs from the user that control
     *  the square's movement, direction and size. */
    method void run() {
        var char key;
        var boolean exit;

        let exit = false;

        while (~exit) {
            // waits for a key to be pressed.
            while (key = 0) {
                let key = Keyboard.keyPressed();
                do moveSquare();
            }

            if (key = 81) {
                let exit = true;
            }
            if (key = 90) {
                do square.decSize();
            }
            if (key = 88) {
                do square.incSize();
            }
            if (key = 131) {
                let direction = 1;
            }
            if (key = 133) {
                let direction = 2;
            }
            if (key = 130) {
                let direction = 3;
            }
            if (key = 132) {
                let direction = 4;
            }

            // waits for the key to be released.
            while (~(key = 0)) {
                let key = Keyboard.keyPressed();
                do moveSquare();
            }
        }
            
        return;
	}

    /** Moves the square by 2 pixels in the current direction. */
    method void moveSquare() {
        if (direction = 1) {
            do square.moveUp();
        }
        if (direction = 2) {
            do square.moveDown();
        }
        if (direction = 3) {
            do square.moveLeft();
        }
        if (direction = 4) {
            do square.moveRight();
        }

        do Sys.wait(5); // Delays the next movement.
        return;
    }
}
`;

const ArrayTestMainJack: string = `
// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/10/ArrayTest/Main.jack

/** Computes the average of a sequence of integers. */
class Main {
    function void main() {
        var Array a;
        var int length;
		var int i, sum;
	
		let length = Keyboard.readInt("HOW MANY NUMBERS? ");
		let a = Array.new(length);
		let i = 0;
	
		while (i < length) {
	  	  	let a[i] = Keyboard.readInt("ENTER THE NEXT NUMBER: ");
	  	 	let i = i + 1;
		}
	
		let i = 0;
		let sum = 0;
	
		while (i < length) {
		    let sum = sum + a[i];
	 	   	let i = i + 1;
		}
	
		do Output.printString("THE AVERAGE IS: ");
		do Output.printInt(sum / length);
		do Output.println();
	
		return;
    }
}
`;

const SquareGameJackk: string = `
// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/09/Square/SquareGame.jack

/**
 * Implements the Square Dance game.
 * In this game you can move a black square around the screen and
 * change its size during the movement.
 * In the beginning, the square is located at the top-left corner
 * of the screen. The arrow keys are used to move the square.
 * The 'z' & 'x' keys are used to decrement and increment the size.
 * The 'q' key is used to quit the game.
 */
class SquareGame {

    // The square
    field Square square;

    // The square's movement direction
    field int direction; // 0=none,1=up,2=down,3=left,4=right

    /** Constructs a new Square Game. */
    constructor SquareGame new() {
      let mezi[expression] = nati;
      do subroutineName(expressionList);
      while (expression) {return;}
      return expression;
    }

    /** Deallocates the object's memory. */
    method void dispose(int age, string name, Square square) {
    }

    /** Starts the game. Handles inputs from the user that control
     *  the square's movement, direction and size. */
    method void run() {
      do random.doIt(expressionList);
	}

    /** Moves the square by 2 pixels in the current direction. */
    method void moveSquare() {
      if(expression) {
        return;
      } else {
        return babay;
      }
    }
}
`;

const MainExpLessJack = `
// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/10/ExpressionlessSquare/Main.jack

// Expressionless version of Main.jack.

/**
 * The Main class initializes a new Square Dance game and starts it.
 */
class Main {

    // Initializes the square game and starts it.
    function void main() {
        var SquareGame game;

        let game = game;
        do game.run();
		do game.dispose();

        return;
    }
}
`;


const SquareExpLessJack = `
// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/10/ExpressionlessSquare/Square.jack

// Expressionless version of Square.jack.

/**
 * The Square class implements a graphic square. A graphic square 
 * has a location on the screen and a size. It also has methods 
 * for drawing, erasing, moving on the screen, and changing its size.
 */
class Square {

    // Location on the screen
    field int x, y;

    // The size of the square
    field int size;

    // Constructs a new square with a given location and size.
    constructor Square new(int Ax, int Ay, int Asize) {
        let x = Ax;
        let y = Ay;
        let size = Asize;

        do draw();

        return x;
    }

    // Deallocates the object's memory.
    method void dispose() {
        do Memory.deAlloc(x);
        return;
    }

    // Draws the square on the screen.
    method void draw() {
        do Screen.setColor(x);
        do Screen.drawRectangle(x, y, x, y);
        return;
    }

    // Erases the square from the screen.
    method void erase() {
        do Screen.setColor(x);
        do Screen.drawRectangle(x, y, x, y);
        return;
    }

    // Increments the size by 2.
    method void incSize() {
        if (x) {
            do erase();
            let size = size;
            do draw();
        }
        return;
    }

    // Decrements the size by 2.
    method void decSize() {
        if (size) {
            do erase();
            let size = size;
            do draw();
        }
        return;
    }

    // Moves up by 2.
    method void moveUp() {
        if (y) {
            do Screen.setColor(x);
            do Screen.drawRectangle(x, y, x, y);
            let y = y;
            do Screen.setColor(x);
            do Screen.drawRectangle(x, y, x, y);
        }
        return;
    }

    // Moves down by 2.
    method void moveDown() {
        if (y) {
            do Screen.setColor(x);
            do Screen.drawRectangle(x, y, x, y);
            let y = y;
            do Screen.setColor(x);
            do Screen.drawRectangle(x, y, x, y);
        }
        return;
    }

    // Moves left by 2.
    method void moveLeft() {
        if (x) {
            do Screen.setColor(x);
            do Screen.drawRectangle(x, y, x, y);
            let x = x;
            do Screen.setColor(x);
            do Screen.drawRectangle(x, y, x, y);
        }
        return;
    }

    // Moves right by 2.
    method void moveRight() {
        if (x) {
            do Screen.setColor(x);
            do Screen.drawRectangle(x, y, x, y);
            let x = x;
            do Screen.setColor(x);
            do Screen.drawRectangle(x, y, x, y);
        }
        return;
    }
}
`;

const SquareGameExpLessJack = `
// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/10/ExpressionlessSquare/SquareGame.jack

// Expressionless version of Square.jack.

/**
 * The SquareDance class implements the Square Dance game.
 * In this game you can move a black square around the screen and
 * change its size during the movement.
 * In the beggining, the square is located at the top left corner.
 * Use the arrow keys to move the square.
 * Use 'z' & 'x' to decrement & increment the size.
 * Use 'q' to quit.
 */
class SquareGame {

    // The square
    field Square square;

    // The square's movement direction
    field int direction; // 0=none,1=up,2=down,3=left,4=right

    // Constructs a new Square Game.
    constructor SquareGame new() {
        let square = square;
        let direction = direction;

        return square;
    }

    // Deallocates the object's memory.
    method void dispose() {
        do square.dispose();
        do Memory.deAlloc(square);
        return;
    }

    // Starts the game. Handles inputs from the user that controls
    // the square movement direction and size.
    method void run() {
        var char key;
        var boolean exit;

        let exit = key;

        while (exit) {
            // waits for a key to be pressed.
            while (key) {
                let key = key;
                do moveSquare();
            }

            if (key) {
                let exit = exit;
            }
            if (key) {
                do square.decSize();
            }
            if (key) {
                do square.incSize();
            }
            if (key) {
                let direction = exit;
            }
            if (key) {
                let direction = key;
            }
            if (key) {
                let direction = square;
            }
            if (key) {
                let direction = direction;
            }

            // waits for the key to be released.
            while (key) {
                let key = key;
                do moveSquare();
            }
        }
            
        return;
    }

    // Moves the square by 2 in the current direction.
    method void moveSquare() {
        if (direction) {
            do square.moveUp();
        }
        if (direction) {
            do square.moveDown();
        }
        if (direction) {
            do square.moveLeft();
        }
        if (direction) {
            do square.moveRight();
        }

        do Sys.wait(direction); // Delays the next movement.
        return;
    }
}
`;

const SquareGameJack = `
// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/09/Square/SquareGame.jack

/**
 * Implements the Square Dance game.
 * In this game you can move a black square around the screen and
 * change its size during the movement.
 * In the beginning, the square is located at the top-left corner
 * of the screen. The arrow keys are used to move the square.
 * The 'z' & 'x' keys are used to decrement and increment the size.
 * The 'q' key is used to quit the game.
 */
class SquareGame {

    // The square
    field Square square;

    // The square's movement direction
    field int direction; // 0=none,1=up,2=down,3=left,4=right

    /** Constructs a new Square Game. */
    constructor SquareGame new() {
        let square = Square.new(0, 0, 30);
        let direction = 0;

        return this;
    }

    /** Deallocates the object's memory. */
    method void dispose() {
        do square.dispose();
        do Memory.deAlloc(this);
        return;
    }

    /** Starts the game. Handles inputs from the user that control
     *  the square's movement, direction and size. */
    method void run() {
        var char key;
        var boolean exit;

        let exit = false;

        while (~exit) {
            // waits for a key to be pressed.
            while (key = 0) {
                let key = Keyboard.keyPressed();
                do moveSquare();
            }

            if (key = 81) {
                let exit = true;
            }
            if (key = 90) {
                do square.decSize();
            }
            if (key = 88) {
                do square.incSize();
            }
            if (key = 131) {
                let direction = 1;
            }
            if (key = 133) {
                let direction = 2;
            }
            if (key = 130) {
                let direction = 3;
            }
            if (key = 132) {
                let direction = 4;
            }

            // waits for the key to be released.
            while (~(key = 0)) {
                let key = Keyboard.keyPressed();
                do moveSquare();
            }
        }
            
        return;
	}

    /** Moves the square by 2 pixels in the current direction. */
    method void moveSquare() {
        if (direction = 1) {
            do square.moveUp();
        }
        if (direction = 2) {
            do square.moveDown();
        }
        if (direction = 3) {
            do square.moveLeft();
        }
        if (direction = 4) {
            do square.moveRight();
        }

        do Sys.wait(5); // Delays the next movement.
        return;
    }
}
`;

const SquareJack = `
// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/09/Square/Square.jack

/**
 * Implements a graphic square. A graphic square has a screen location
 * and a size. It also has methods for drawing, erasing, moving on the 
 * screen, and changing its size.
 */
class Square {

    // Location on the screen
    field int x, y;

    // The size of the square
    field int size;

    /** Constructs a new square with a given location and size. */
    constructor Square new(int Ax, int Ay, int Asize) {
        let x = Ax;
        let y = Ay;
        let size = Asize;

        do draw();

        return this;
    }

    /** Deallocates the object's memory. */
    method void dispose() {
        do Memory.deAlloc(this);
        return;
    }

    /** Draws the square on the screen. */
    method void draw() {
        do Screen.setColor(true);
        do Screen.drawRectangle(x, y, x + size, y + size);
        return;
    }

    /** Erases the square from the screen. */
    method void erase() {
        do Screen.setColor(false);
        do Screen.drawRectangle(x, y, x + size, y + size);
        return;
    }

    /** Increments the size by 2 pixels. */
    method void incSize() {
        if (((y + size) < 254) & ((x + size) < 510)) {
            do erase();
            let size = size + 2;
            do draw();
        }
        return;
    }

    /** Decrements the size by 2 pixels. */
    method void decSize() {
        if (size > 2) {
            do erase();
            let size = size - 2;
            do draw();
        }
        return;
	}

    /** Moves up by 2 pixels. */
    method void moveUp() {
        if (y > 1) {
            do Screen.setColor(false);
            do Screen.drawRectangle(x, (y + size) - 1, x + size, y + size);
            let y = y - 2;
            do Screen.setColor(true);
            do Screen.drawRectangle(x, y, x + size, y + 1);
        }
        return;
    }

    /** Moves down by 2 pixels. */
    method void moveDown() {
        if ((y + size) < 254) {
            do Screen.setColor(false);
            do Screen.drawRectangle(x, y, x + size, y + 1);
            let y = y + 2;
            do Screen.setColor(true);
            do Screen.drawRectangle(x, (y + size) - 1, x + size, y + size);
        }
        return;
    }

    /** Moves left by 2 pixels. */
    method void moveLeft() {
        if (x > 1) {
            do Screen.setColor(false);
            do Screen.drawRectangle((x + size) - 1, y, x + size, y + size);
            let x = x - 2;
            do Screen.setColor(true);
            do Screen.drawRectangle(x, y, x + 1, y + size);
        }
        return;
    }

    /** Moves right by 2 pixels. */
    method void moveRight() {
        if ((x + size) < 510) {
            do Screen.setColor(false);
            do Screen.drawRectangle(x, y, x + 1, y + size);
            let x = x + 2;
            do Screen.setColor(true);
            do Screen.drawRectangle((x + size) - 1, y, x + size, y + size);
        }
        return;
    }
}
`;

const MainJack = `
// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/09/Square/Main.jack

/**
 * The Main class initializes a new Square Dance game and starts it.
 */
class Main {

    /** Initializes a new game and starts it. */    
    function void main() {
        var SquareGame game;

        let game = SquareGame.new();
        do game.run();
		do game.dispose();

        return;
    }
}
`;

const ArrayMainJack = `
// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/10/ArrayTest/Main.jack

/** Computes the average of a sequence of integers. */
class Main {
    function void main() {
        var Array a;
        var int length;
		var int i, sum;
	
		let length = Keyboard.readInt("HOW MANY NUMBERS? ");
		let a = Array.new(length);
		let i = 0;
	
		while (i < length) {
	  	  	let a[i] = Keyboard.readInt("ENTER THE NEXT NUMBER: ");
	  	 	let i = i + 1;
		}
	
		let i = 0;
		let sum = 0;
	
		while (i < length) {
		    let sum = sum + a[i];
	 	   	let i = i + 1;
		}
	
		do Output.printString("THE AVERAGE IS: ");
		do Output.printInt(sum / length);
		do Output.println();
	
		return;
    }
}
`;