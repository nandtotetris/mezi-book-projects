import { Col, Layout, Row } from 'antd';
import UploadComponent from 'components/Upload/UploadComponent';
import CompilationEngine from 'dismantle/Compiler/CompilationEngine';
import ExtendedCompilationEngine from 'dismantle/Compiler/ExtendedCompilationEngine';
import JackCompiler, { ISource } from 'dismantle/Compiler/JackCompiler';
import JackTokenizer from 'dismantle/Compiler/JackTokenizer';
import VMTranslator from 'dismantle/MyVMTranslator/VMTranslator';
import HackAssemblerTranslator from 'dismantle/Translator/HackAssemblerTranslator';
import Definitions from 'dismantle/Utilities/Definitions';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import Tokenizr from 'tokenizr';

interface IProps extends RouteComponentProps {}

const onFileChange = (content: string) => {
  // tslint:disable-next-line: no-console
  console.log(`Content is: ${content}`);
};

const SevenJack = () => {
  return `
  // This file is part of www.nand2tetris.org
  // and the book "The Elements of Computing Systems"
  // by Nisan and Schocken, MIT Press.
  // File name: projects/11/Seven/Main.jack
  
  /**
   * Computes the value of 1 + (2 * 3) and prints the result
   *  at the top-left of the screen.  
   */
  class Main {
  
     function void main() {
         do Output.printInt(1 + (2 * 3));
         return;
     }
  
  }  
  `;
};

const ConvertToBinJack = () => {
  return `
  // This file is part of www.nand2tetris.org
  // and the book "The Elements of Computing Systems"
  // by Nisan and Schocken, MIT Press.
  // File name: projects/11/ConvertToBin/Main.jack
  
  /**
   * Unpacks a 16-bit number into its binary representation:
   * Takes the 16-bit number stored in RAM[8000] and stores its individual 
   * bits in RAM[8001..8016] (each location will contain 0 or 1).
   * Before the conversion, RAM[8001]..RAM[8016] are initialized to -1.
   * 
   * The program should be tested as follows:
   * 1) Load the program into the supplied VM Emulator
   * 2) Put some value in RAM[8000]
   * 3) Switch to "no animation"
   * 4) Run the program (give it enough time to run)
   * 5) Stop the program
   * 6) Check that RAM[8001]..RAM[8016] contains the correct binary result, and
   *    that none of these memory locations contain -1.
   */
  class Main {
      
      /**
       * Initializes RAM[8001]..RAM[8016] to -1, and converts the value in
       * RAM[8000] to binary.
       */
      function void main() {
    var int result, value;
          
          do Main.fillMemory(8001, 16, -1); // sets RAM[8001]..RAM[8016] to -1
          let value = Memory.peek(8000);    // reads a value from RAM[8000]
    do Main.convert(value);           // perform the conversion
      
        return;
      }
      
      /** Converts the given decimal value to binary, and puts 
       *  the resulting bits in RAM[8001]..RAM[8016]. */
      function void convert(int value) {
        var int mask, position;
        var boolean loop;
        
        let loop = true;
   
        while (loop) {
            let position = position + 1;
            let mask = Main.nextMask(mask);
              do Memory.poke(9000 + position, mask);
        
            if (~(position > 16)) {
        
                if (~((value & mask) = 0)) {
                    do Memory.poke(8000 + position, 1);
                   }
                else {
                    do Memory.poke(8000 + position, 0);
                  }    
            }
            else {
                let loop = false;
            }
        }
        
        return;
      }
   
      /** Returns the next mask (the mask that should follow the given mask). */
      function int nextMask(int mask) {
        if (mask = 0) {
            return 1;
        }
        else {
        return mask * 2;
        }
      }
      
      /** Fills 'length' consecutive memory locations with 'value',
        * starting at 'startAddress'. */
      function void fillMemory(int startAddress, int length, int value) {
          while (length > 0) {
              do Memory.poke(startAddress, value);
              let length = length - 1;
              let startAddress = startAddress + 1;
          }
          
          return;
      }
  }    
  `;
};

const SquareMainJack = () => {
  return `
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
};

const SquareJack = () => {
  return `
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
};

const SquareGameJack = () => {
  return `
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
};

const AverageJack = () => {
  return `
// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/11/Average/Main.jack

/** Computes the average of a sequence of integers */
class Main {
    function void main() {
        var Array a;
        var int length;
	var int i, sum;
	
	let length = Keyboard.readInt("How many numbers? ");
	let a = Array.new(length);
	let i = 0;
	
	while (i < length) {
	    let a[i] = Keyboard.readInt("Enter the next number: ");
	    let i = i + 1;
	}
	
	let i = 0;
	let sum = 0;
	
	while (i < length) {
	    let sum = sum + a[i];
	    let i = i + 1;
	}
	
	do Output.printString("The average is: ");
	do Output.printInt(sum / length);
	do Output.println();
	
	return;
    }
}
`;
};

const BallJack = () => {
  return `
  // This file is part of www.nand2tetris.org
  // and the book "The Elements of Computing Systems"
  // by Nisan and Schocken, MIT Press.
  // File name: projects/11/Pong/Ball.jack
  
  /**
   * A graphic ball. Has a screen location and distance of last destination.
   * Has methods for drawing, erasing and moving on the screen.
   * The ball's dimensions are 6X6 pixels.
   */
  class Ball {
  
      // The ball's screen location (in pixels)
      field int x, y;
  
      // Distance of last destination
      field int lengthx, lengthy;
  
      // Used for straight line movement computation
      field int d, straightD, diagonalD;
      field boolean invert, positivex, positivey;
  
      // wall locations
      field int leftWall, rightWall, topWall, bottomWall;
  
      // last wall that the ball was bounced from
      field int wall;
  
      /** Constructs a new Ball with a given initial location
       *  and the locations of the walls. */
      constructor Ball new(int Ax, int Ay, int AleftWall, int ArightWall, int AtopWall, int AbottomWall) {    	
    let x = Ax;		
    let y = Ay;
    let leftWall = AleftWall;
    let rightWall = ArightWall - 6; // -6 for ball size
    let topWall = AtopWall; 
    let bottomWall = AbottomWall - 6; // -6 for ball size
    let wall = 0;
        
          do show();
  
          return this;
      }
  
      /** Deallocates the object's memory. */
      method void dispose() {
          do Memory.deAlloc(this);
          return;
      }
  
      /** Draws the ball on the screen. */
      method void show() {
          do Screen.setColor(true);
    do draw();
          return;
      }
  
      /** Erases the ball from the screen. */
      method void hide() {
          do Screen.setColor(false);
    do draw();
          return;
      }
  
      /** Draws the ball. */
      method void draw() {
    do Screen.drawRectangle(x, y, x + 5, y + 5);
    return;
      }
  
      /** Returns the left edge of the ball. */
      method int getLeft() {
          return x;
      }
  
      /** Returns the right edge of the ball. */
      method int getRight() {
          return x + 5;
      }
  
      /** Sets the destination of the ball. */
      method void setDestination(int destx, int desty) {
          var int dx, dy, temp;
  
    let lengthx = destx - x;
    let lengthy = desty - y;
          let dx = Math.abs(lengthx);
          let dy = Math.abs(lengthy);
          let invert = (dx < dy);
  
          // scan should be on Y-axis
          if (invert) {
              let temp = dx; // swap dx, dy
              let dx = dy;
              let dy = temp;
  
           let positivex = (y < desty);
              let positivey = (x < destx);
          }
          else {
        let positivex = (x < destx);
              let positivey = (y < desty);
          }
  
          let d = (2 * dy) - dx;
          let straightD = 2 * dy;
          let diagonalD = 2 * (dy - dx);
  
    return;
      }
  
      /**
       * Moves the ball one unit towards its destination.
       * Returns 0 if the ball has not reached a wall.
       * If it did, returns a value according to the wall:
       * 1-left wall, 2-right wall, 3-top wall, 4-bottom wall.
       */
      method int move() {
  
    do hide();
  
          if (d < 0) {
              let d = d + straightD;
          }
          else {
              let d = d + diagonalD;
  
              if (positivey) {
             if (invert) {
             let x = x + 4;
                }
                  else {
          let y = y + 4;
                  }
              }
              else {
             if (invert) {
             let x = x - 4;
                }
                  else {
          let y = y - 4;
                  }
              }
    }
  
          if (positivex) {
              if (invert) {
           let y = y + 4;
            }
              else {
            let x = x + 4;
              }
    }
    else {
              if (invert) {
            let y = y - 4;
        }
              else {
      let x = x - 4;
              }
    }
  
    if (~(x > leftWall)) {
        let wall = 1;    
        let x = leftWall;
    }
          if (~(x < rightWall)) {
        let wall = 2;    
        let x = rightWall;
    }
          if (~(y > topWall)) {
              let wall = 3;    
        let y = topWall;
          }
          if (~(y < bottomWall)) {
              let wall = 4;    
        let y = bottomWall;
          }
  
    do show();
  
    return wall;
      }
  
      /**
       * Bounces from the current wall: sets the new destination
       * of the ball according to the ball's angle and the given
       * bouncing direction (-1/0/1=left/center/right or up/center/down).
       */
      method void bounce(int bouncingDirection) {
    var int newx, newy, divLengthx, divLengthy, factor;
  
    // dividing by 10 first since results are too big
          let divLengthx = lengthx / 10;
          let divLengthy = lengthy / 10;
    if (bouncingDirection = 0) {
        let factor = 10;
    }
    else {
        if (((~(lengthx < 0)) & (bouncingDirection = 1)) | ((lengthx < 0) & (bouncingDirection = (-1)))) {
            let factor = 20; // bounce direction is in ball direction
           }
        else {
            let factor = 5; // bounce direction is against ball direction
        }
    }
  
    if (wall = 1) {
        let newx = 506;
        let newy = (divLengthy * (-50)) / divLengthx;
              let newy = y + (newy * factor);
    }
    else {
         if (wall = 2) {
            let newx = 0;
            let newy = (divLengthy * 50) / divLengthx;
                  let newy = y + (newy * factor);
        }
        else {
             if (wall = 3) {
          let newy = 250;
          let newx = (divLengthx * (-25)) / divLengthy;
                let newx = x + (newx * factor);
      }
            else { // assumes wall = 4
          let newy = 0;
          let newx = (divLengthx * 25) / divLengthy;
                let newx = x + (newx * factor);
      }
        }
    }
  
    do setDestination(newx, newy);
  
    return;
      }
  }    
  `;
};

const BatJack = () => {
  return `
  // This file is part of www.nand2tetris.org
  // and the book "The Elements of Computing Systems"
  // by Nisan and Schocken, MIT Press.
  // File name: projects/11/Pong/Bat.jack.
  
  /**
   * A graphic Pong bat. Has a screen location, width and height.
   * Has methods for drawing, erasing, moving left and right on
   * the screen and changing the width. 
   */
  class Bat {
  
      // The screen location
      field int x, y;
  
      // The width and height
      field int width, height;
  
      // The direction of the bat's movement
      field int direction; // 1 = left, 2 = right
  
      /** Constructs a new bat with the given location and width. */
      constructor Bat new(int Ax, int Ay, int Awidth, int Aheight) {
    let x = Ax;
    let y = Ay;
    let width = Awidth;
    let height = Aheight;
    let direction = 2;
  
          do show();
  
          return this;
      }
  
      /** Deallocates the object's memory. */
      method void dispose() {
          do Memory.deAlloc(this);
          return;
      }
  
      /** Draws the bat on the screen. */
      method void show() {
          do Screen.setColor(true);
    do draw();
          return;
      }
  
      /** Erases the bat from the screen. */
      method void hide() {
          do Screen.setColor(false);
    do draw();
          return;
      }
  
      /** Draws the bat. */
      method void draw() {
    do Screen.drawRectangle(x, y, x + width, y + height);
    return;
      }
  
      /** Sets the direction of the bat (0=stop, 1=left, 2=right). */
      method void setDirection(int Adirection) {
    let direction = Adirection;
          return;
      }
  
      /** Returns the left edge of the bat. */
      method int getLeft() {
          return x;
      }
  
      /** Returns the right edge of the bat. */
      method int getRight() {
          return x + width;
      }
  
      /** Sets the width. */
      method void setWidth(int Awidth) {
          do hide();
    let width = Awidth;
          do show();
          return;
      }
  
      /** Moves the bat one step in its direction. */
      method void move() {
    if (direction = 1) {
              let x = x - 4;
        if (x < 0) {
      let x = 0;
            }
              do Screen.setColor(false);
              do Screen.drawRectangle((x + width) + 1, y, (x + width) + 4, y + height);
              do Screen.setColor(true);
           do Screen.drawRectangle(x, y, x + 3, y + height);
    } 
    else {
              let x = x + 4;
        if ((x + width) > 511) {
      let x = 511 - width;
          }
              do Screen.setColor(false);
              do Screen.drawRectangle(x - 4, y, x - 1, y + height);
              do Screen.setColor(true);
        do Screen.drawRectangle((x + width) - 3, y, x + width, y + height);
    }
  
          return;
      }
  }    
  `;
};

const PongMainJack = () => {
  return `
  // This file is part of www.nand2tetris.org
  // and the book "The Elements of Computing Systems"
  // by Nisan and Schocken, MIT Press.
  // File name: projects/11/Pong/Main.jack
  
  /**
   * The main class of the Pong game.
   */
  class Main {
  
      /** Initializes the Pong game and starts it. */
      function void main() {
          var PongGame game;
  
    do PongGame.newInstance();
          let game = PongGame.getInstance();
          do game.run();
    do game.dispose();
  
          return;
      }
  }    
  `;
};

const PongGameJack = () => {
  return `
  // This file is part of www.nand2tetris.org
  // and the book "The Elements of Computing Systems"
  // by Nisan and Schocken, MIT Press.
  // File name: projects/11/Pong/PongGame.jack
  
  /**
   * The Pong game.
   */
  class PongGame {
  
      // The singlton 
      static PongGame instance;
  
      // The bat
      field Bat bat;
  
      // The ball
      field Ball ball;
  
      // The current wall that the ball is bouncing from.
      field int wall;
  
      // True when the game is over
      field boolean exit;
  
      // The current score.
      field int score;
  
      // The last wall that the ball bounced from.
      field int lastWall;
  
      // The current width of the bat
      field int batWidth;
  
      /** Constructs a new Pong Game. */
      constructor PongGame new() {
    do Screen.clearScreen();
  
    let batWidth = 50;
          let bat = Bat.new(230, 229, batWidth, 7);
  
          let ball = Ball.new(253, 222, 0, 511, 0, 229);
    do ball.setDestination(400,0);
  
    do Screen.drawRectangle(0, 238, 511, 240);
    do Output.moveCursor(22,0);
    do Output.printString("Score: 0");
    
    let exit = false;
    let score = 0;
    let wall = 0;
    let lastWall = 0;
  
          return this;
      }
  
      /** Deallocates the object's memory. */
      method void dispose() {
          do bat.dispose();
      do ball.dispose();
          do Memory.deAlloc(this);
          return;
      }
  
      /** Creates an instance of PongGame and stores it. */
      function void newInstance() {
          let instance = PongGame.new();
          return;
      }
      
      /** Returns the single instance of PongGame. */
      function PongGame getInstance() {
          return instance;
      }
  
      /** Starts the game. Handles inputs from the user that control
       *  the bat's movement direction. */
      method void run() {
          var char key;
  
          while (~exit) {
              // waits for a key to be pressed.
              while ((key = 0) & (~exit)) {
                  let key = Keyboard.keyPressed();
                  do bat.move();
      do moveBall();
              }
  
              if (key = 130) {
            do bat.setDirection(1);
              }
        else {
            if (key = 132) {
                 do bat.setDirection(2);
                  }
      else {
                if (key = 140) {
                          let exit = true;
          }
      }
              }
  
              // Waits for the key to be released.
              while ((~(key = 0)) & (~exit)) {
                  let key = Keyboard.keyPressed();
                  do bat.move();
                  do moveBall();
              }
          }
  
    if (exit) {
            do Output.moveCursor(10,27);
        do Output.printString("Game Over");
    }
              
          return;
      }
  
      /**
       * Handles ball movement, including bouncing.
       * If the ball bounces from the wall, finds its new direction.
       * If the ball bounces from the bat, shrinks the bat's size and
       * increases the score by one.
       */
      method void moveBall() {
    var int bouncingDirection, batLeft, batRight, ballLeft, ballRight;
  
    let wall = ball.move();
  
    if ((wall > 0) & (~(wall = lastWall))) {
        let lastWall = wall;
        let bouncingDirection = 0;
        let batLeft = bat.getLeft();
        let batRight = bat.getRight();
        let ballLeft = ball.getLeft();
        let ballRight = ball.getRight();
    
        if (wall = 4) {
      let exit = (batLeft > ballRight) | (batRight < ballLeft);
            if (~exit) {
          if (ballRight < (batLeft + 10)) {
        let bouncingDirection = -1;
          }
          else {
        if (ballLeft > (batRight - 10)) {
            let bouncingDirection = 1;
        }
          }
  
          let batWidth = batWidth - 2;
          do bat.setWidth(batWidth);			
            let score = score + 1;
          do Output.moveCursor(22,7);
          do Output.printInt(score);
      }
        }
  
          do ball.bounce(bouncingDirection);
    }
  
    return;
      }
  }    
  `;
};

const ArrayMainJack = () => {
  return `
  // This file is part of www.nand2tetris.org
  // and the book "The Elements of Computing Systems"
  // by Nisan and Schocken, MIT Press.
  // File name: projects/11/ComplexArrays/Main.jack
  
  /**
   * Performs several complex Array tests.
   * For each test, the required result is printed along with the
   * actual result. In each test, the two results should be equal.
   */
  class Main {
  
      function void main() {
          var Array a, b, c;
          
          let a = Array.new(10);
          let b = Array.new(5);
          let c = Array.new(1);
          
          let a[3] = 2;
          let a[4] = 8;
          let a[5] = 4;
          let b[a[3]] = a[3] + 3;  // b[2] = 5
          let a[b[a[3]]] = a[a[5]] * b[((7 - a[3]) - Main.double(2)) + 1];  // a[5] = 8 * 5 = 40
          let c[0] = null;
          let c = c[0];
          
          do Output.printString("Test 1 - Required result: 5, Actual result: ");
          do Output.printInt(b[2]);
          do Output.println();
          do Output.printString("Test 2 - Required result: 40, Actual result: ");
          do Output.printInt(a[5]);
          do Output.println();
          do Output.printString("Test 3 - Required result: 0, Actual result: ");
          do Output.printInt(c);
          do Output.println();
          
          let c = null;
  
          if (c = null) {
              do Main.fill(a, 10);
              let c = a[3];
              let c[1] = 33;
              let c = a[7];
              let c[1] = 77;
              let b = a[3];
              let b[1] = b[1] + c[1];  // b[1] = 33 + 77 = 110;
          }
  
          do Output.printString("Test 4 - Required result: 77, Actual result: ");
          do Output.printInt(c[1]);
          do Output.println();
          do Output.printString("Test 5 - Required result: 110, Actual result: ");
          do Output.printInt(b[1]);
          do Output.println();
          
          return;
      }
      
      function int double(int a) {
        return a * 2;
      }
      
      function void fill(Array a, int size) {
          while (size > 0) {
              let size = size - 1;
              let a[size] = Array.new(3);
          }
          
          return;
      }
  }    
  `;
};

const assemble = () => {
  localStorage.setItem('mezi.asm', 'labelledAssembly');
  const program: number[] = HackAssemblerTranslator.loadProgram(
    'mezi.asm',
    Definitions.ROM_SIZE,
    HackAssemblerTranslator.NOP,
  );
  let i = -1;
  let assembly = '';
  while (1) {
    i++;
    if (program[i] === 32768) {
      break;
    }
    let output = Number(program[i]).toString(2);
    const outLen = output.length;
    if (outLen < 16) {
      const padLen = 16 - outLen;
      let pad = '';
      for (let j = 0; j < padLen; j++) {
        pad = pad.concat('0');
      }
      output = pad.concat(output);
    }
    assembly = `${assembly}\n${output}`;
  }
  // tslint:disable-next-line: no-console
  console.log(assembly);
};

const translateVM = () => {
  // localStorage.setItem('Nested', Nested);
  // localStorage.setItem('Class1', Class1);
  // localStorage.setItem('Class2', Class2);
  // localStorage.setItem('Main', Main);
  // localStorage.setItem('FibonacciSys', FibonacciSys);
  // localStorage.setItem('StaticSys', StaticSys);

  const vms = ['Class1', 'Class2', 'StaticSys'];
  const translator: VMTranslator = new VMTranslator(vms, 'vmOutput');
  translator.translate();
};

const testTokenizr = () => {
  const parser: Tokenizr = new Tokenizr();
  const input = `
    hello there // this is comment
    "string negn 123"  890
    and mnamn
  `;
  parser.input(input);
  parser.debug(false);
  parser.rule(/(?:\/\*(?:[\s\S]*?)\*\/)|(\/\/.*)/, (ctx, match) => {
    ctx.ignore();
  });
  parser.rule(/[ \t\r\n]+/, (ctx, match) => {
    ctx.ignore();
  });
  parser.rule(/"[^\r\n\\"]*"/, (ctx, match) => {
    ctx.accept('string');
  });
  parser.rule(/[0-9]+/, (ctx, match) => {
    ctx.accept('number');
  });
  parser.rule(/[a-zA-Z_][a-zA-Z0-9_]*/, (ctx, match) => {
    ctx.accept('identifier');
  });
  const hasMoreTokens = () => {
    try {
      const peekedToken: any = parser.peek(1);
      return peekedToken !== null;
    } catch {
      return false;
    }
  };
  let token: any;
  while (hasMoreTokens()) {
    token = parser.token();
    // tslint:disable-next-line: no-console
    console.log(token.value);
  }
};

const testJackTokenizer = (source: string) => {
  const tokenizer: JackTokenizer = new JackTokenizer(source);
  const output: string[] = [];
  while (tokenizer.hasMoreTokens()) {
    tokenizer.advance();
    switch (tokenizer.tokenType()) {
      case JackTokenizer.TYPE_KEYWORD:
        output.push(`<keyword>${tokenizer.keyWord()}</keyword>`);
        break;
      case JackTokenizer.TYPE_SYMBOL:
        let symbol: string = tokenizer.symbol();
        const escapedSymbols: any = {
          '"': '&quot;',
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
        };
        if (escapedSymbols[symbol] !== undefined) {
          symbol = escapedSymbols[symbol];
        }
        output.push(`<symbol>${symbol}</symbol>`);
        break;
      case JackTokenizer.TYPE_IDENTIFIER:
        output.push(`<identifier>${tokenizer.identifier()}</identifier>`);
        break;
      case JackTokenizer.TYPE_INT_CONST:
        output.push(`<integerConstant>${tokenizer.intVal()}</integerConstant>`);
        break;
      case JackTokenizer.TYPE_STRING_CONST:
        output.push(
          `<stringConstant>${tokenizer.stringVal()}</stringConstant>`,
        );
        break;
      default:
        break;
    }
  }
  const tokensList: string = output.join('\n');
  const xmlOutput: string = `<tokens>\n${tokensList}\n</tokens>`;
  // tslint:disable-next-line: no-console
  console.log(xmlOutput);
};

const testCompilationEngine = (source: string) => {
  const engine: CompilationEngine = new CompilationEngine(source, '');
  const extendedEngine: ExtendedCompilationEngine = new ExtendedCompilationEngine(
    source,
    '',
  );
  // tslint:disable-next-line: no-console
  console.log(extendedEngine.getOutput());
};

const testJackCompiler = (sources: ISource[]) => {
  const compiler: JackCompiler = new JackCompiler(sources);
  compiler.compile();
};

const NotFound: React.FunctionComponent<IProps> = ({ location }) => {
  // assemble();
  // translateVM();
  // testTokenizr();
  // testJackTokenizer(ArrayTestMainJack);
  // testCompilationEngine(SquareGameJack());
  testJackCompiler([
    {
      code: SquareMainJack(),
      name: 'Array.jack',
    },
  ]);
  return (
    <Layout style={{ flex: 1, width: '100%', height: '100%' }}>
      <Layout.Content
        style={{
          alignItems: 'center',
          background: '#fff',
          display: 'flex',
          height: '600px',
          justifyContent: 'center',
          minWidth: '100%',
        }}
      >
        <Col style={{ minWidth: '50%' }}>
          <Row
            style={{
              alignItems: 'center',
              display: 'flex',
              height: '300px',
              justifyContent: 'center',
              padding: '25px',
            }}
          >
            <div>Hello</div>
          </Row>
          <Row
            style={{
              alignItems: 'center',
              display: 'flex',
              height: '300px',
              justifyContent: 'center',
              padding: '25px',
            }}
          >
            <UploadComponent onFileChange={onFileChange} />
          </Row>
        </Col>
        <Col style={{ minWidth: '50%' }}>
          <Row
            style={{
              alignItems: 'center',
              display: 'flex',
              height: '300px',
              justifyContent: 'center',
              padding: '25px',
            }}
          >
            <div>Hello</div>
          </Row>
          <Row
            style={{
              alignItems: 'center',
              display: 'flex',
              height: '300px',
              justifyContent: 'center',
              padding: '25px',
            }}
          >
            <div>Hello</div>
          </Row>
        </Col>
      </Layout.Content>
    </Layout>
  );
};

export default NotFound;
