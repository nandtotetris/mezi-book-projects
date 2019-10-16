export const Array = () => {
  return `
  // This file is part of www.nand2tetris.org
  // and the book "The Elements of Computing Systems"
  // by Nisan and Schocken, MIT Press.
  // File name: projects/12/Array.jack
  
  /**
   * Represents an array. Can be used to hold any type of object.
   */
  class Array {
  
      /** Constructs a new Array of the given size. */
      function Array new(int size) {
          return Memory.alloc(size);
      }
  
      /** De-allocates the array and frees its space. */
      method void dispose() {
          do Memory.deAlloc(this);
          return;
      }
  }    
  `;
};

export const Memory = () => {
  return `
  // This file is part of www.nand2tetris.org
  // and the book "The Elements of Computing Systems"
  // by Nisan and Schocken, MIT Press.
  // File name: projects/12/Memory.jack
  
  /**
   * Memory operations library.
   */ 
  class Memory {
  
      static int freeList, LENGTH, NEXT;
      static boolean hasDefragmented;
  
      /** Initializes memory parameters. */
      function void init() {
          // length is found at index 0
          let LENGTH = 0;
          // the next pointer is found at index 0
          let NEXT = 1;
          // freeList =  heapBase
          let freeList = 2048;
          // freeList.length = heapLength
          let freeList[LENGTH] = 14335;
          // freeList.next = null
          let freeList[NEXT] = null;
          // no defragmentation done yet
          let hasDefragmented = false;
          return;
      }
  
      /** Returns the value of the main memory at the given address. */
      function int peek(int address) {
          return address[0];
      }
  
      /** Sets the value of the main memory at    this address
       *  to the given value. */
      function void poke(int address, int value) {
          let address[0] = value;
          return;
      }
  
      /** finds and allocates from the heap a memory block of the 
       *  specified size and returns a reference to its base address. */
      function int alloc(int size) {
          var int currentSegment, previousSegment, length, block, leftOver;
          var boolean loop;
          let loop = true;
          // search freeList using best-fit or first-fit heuristics to obtain 
          // a segment with segment.length > size. If no such segment is found, 
          // return failure (or attempt defragmentation)
          let previousSegment = freeList;
          let currentSegment = freeList;
          while (loop) {
              let length = currentSegment[LENGTH];
              if (length > size) {
                  let loop = false;
              } else {
                  // check if next is null
                  if (currentSegment[NEXT] = null) {
                      if (hasDefragmented) {
                          // return error
                          return Sys.error(1);
                      } else {
                          // defragment
                          do Memory.defragment(size);
                          // set defragmentation flag
                          let hasDefragmented = true;
                          // and then try reallocating
                          let block = Memory.alloc(size);
                          // rest the defragmentation flag
                          let hasDefragmented = false;
                          return block;
                      }
                  }
                  // update Previous segment
                  let previousSegment = currentSegment;
                  // update current segment
                  let currentSegment = currentSegment[NEXT];
  
              }
          }
          // update the freeList to reflect the allocation
          let leftOver = length - (size + 1);
          if (leftOver < 2) {
              // no leftover, or practically useless leftOver
              // at least 3, 2 for headers 1 for data, required
              let previousSegment[NEXT] = currentSegment[NEXT];
              return currentSegment;
          }
          // update length of remaining block
          let currentSegment[LENGTH] = length - (size + 1);
          // get block
          let block = currentSegment + (length - size);
          // assign new length
          let block[-1] = size + 1;
          return block;
  
      }
  
      /** Does defragmentation for a given size **/
      function void defragment(int size) {
          var int currentSegment, nextSegment;
          var boolean loop;
          let currentSegment = freeList;
          let loop = true;
          while (loop) {
              if (currentSegment[NEXT] = null) {
                  return;
              }
              let nextSegment = currentSegment[1];
  
              if ( (currentSegment[LENGTH] + nextSegment[LENGTH]) > size) {
                  // update the length of the first segment
                  let currentSegment[LENGTH] = currentSegment[LENGTH] + nextSegment[0];
                  // update the pointer of the first segment
                  let currentSegment[NEXT] = nextSegment[NEXT];
                  // exit the loop
                  let loop = false;
              } 
              // keep searching, for sufficient adjacents
              let currentSegment = nextSegment;
          }
          return;
      }
  
      /** De-allocates the given object and frees its space. */
      function void deAlloc(int object) {
          var int segment, temp;
          // segment = object - 1
          let segment = object - 1;
          // segment.length = object[-1]
          let segment[LENGTH] = object[-1];
          if (freeList[NEXT] = null) {
              let freeList[NEXT] = segment;
              let segment[NEXT] = null;
          } else {
              // insert at the second positin in
              // the linked list
              let temp = freeList[NEXT];
              let freeList[NEXT] = segment;
              let segment[NEXT] = temp;
          }      
          return;
      }    
  }    
  `;
};

export const Math = () => {
  return `
  // This file is part of www.nand2tetris.org
  // and the book "The Elements of Computing Systems"
  // by Nisan and Schocken, MIT Press.
  // File name: projects/12/Math.jack
  
  /**
   * A basic math library.
   */
  class Math {
  
      static int doubleYQ;
      static Array twoToThe;
  
      /** Initializes the library. */
      function void init() {
          var int i, powOf2;
  
          let doubleYQ = 0;
  
          // populate the twoToThe array
          let i = 0;
          let powOf2 = 1;
          let twoToThe = Array.new(16);
          while (i < 16) {
              let twoToThe[i] = powOf2;
              let powOf2 = powOf2 + powOf2;
              let i = i + 1;
          }
          return;
      }
  
      /** Returns the absolute value of x. */
      function int abs(int x) {
          if (x < 0) {
              return -x;
          } else {
              return x;
          }
      }
  
      /** Returns the product of x and y. */
      function int multiply(int x, int y) {
          // where x, y >= 0
          var int sum, shiftedX, j, n;
          var boolean loop, isJthBitOne;
          let sum = 0;
          let j = 0;
          let shiftedX = x;
          let loop = true;
          let isJthBitOne = false;
          // number of bits of y, use 16 for now, you 
          // should use the exact number of bits (if
          // there is a way to efficiently calculate it)
          let n = 16;
          while (loop) {
              // calculate jth bit of y
              let isJthBitOne = ((y & twoToThe[j]) = twoToThe[j]);
              // if jthBit === 1, add shiftedX to sum
              if (isJthBitOne) {
                  let sum = sum + shiftedX;
              }
              // keep shifting x
              let shiftedX = shiftedX + shiftedX;
              // iterate for the number of bits n = 16
              let j = j + 1;            
              // end of loop
              if (j = n) {
                  let loop = false;
              }            
          }
          return sum;
      }
  
      /** Returns the integer part of x/y. */
      function int doDivide(int x, int y) {
          var int quotient, remainder, doubleY;
          // divisor is larger than dividend, so 0 quotient
          if (y > x) {
              let doubleYQ = 0;
              return 0;
          }
          // see if dividend is enough for 2 ys
          let doubleY = y + y;
          // detect overflow
          if (doubleY < 0) {
              let doubleYQ = 0;
              return 0;
          }
          let quotient = Math.doDivide(x, doubleY);
          // calculate remainder
          let remainder = x - doubleYQ;
          // multiply by 2, since our target divisor is y, and not 2y
          let quotient = quotient + quotient;
          if (remainder < y) {
              // discard the fractional part
              return quotient;
          } else {
              let doubleYQ = y + doubleYQ;
              // dividend had enough place for one more y
              return quotient + 1;
          }
      }    
  
      function int divide(int x, int y) {
          var int quotient;
          // prevent division by zero
          if (y = 0) {
              do Sys.error(0);
          }
          // quotient will be positive is their sign bits are identical
          let quotient = Math.doDivide(Math.abs(x), Math.abs(y));
          if ((x < 0) = (y < 0)) {
              return quotient;
          } else {
              return -quotient;
          }
      }
  
      /** Returns the integer part of the square root of x. */
      function int sqrt(int x) {
          var int j, y, n, yPlusJthPowOf2, yPlusJthPowOf2Squared;
          var boolean loop;
          // number of bits of x, use 16 (though it might actually
          // be less than that)
          // j = n/2 - 1
          let n = 16;
          let j = n / 2 - 1;
          let loop = true;
          let y = 0;
          while (loop) {
              // (y + 2^j)^2 <= x
              let yPlusJthPowOf2 = y + twoToThe[j];
              let yPlusJthPowOf2Squared = yPlusJthPowOf2 * yPlusJthPowOf2;
              // the first condition checks for overflow
              if ((yPlusJthPowOf2Squared > 0) & ((yPlusJthPowOf2Squared - x) < 1)) {
                  let y = yPlusJthPowOf2;
              }
              // check for the condition
              if (j = 0) {
                  let loop = false;
              } 
              // update j
              let j = j - 1;              
              
          }
          return y;
      }
  
      /** Returns the greater number. */
      function int max(int a, int b) {
          if ((a - b) > 0) {
              return a;
          } else {
              return b;
          }
      }
  
      /** Returns the smaller number. */
      function int min(int a, int b) {
          if ((a - b) < 0) {
              return a;
          } else {
              return b;
          }        
      }
  }  
  `;
};

export const Sys = () => {
  return `
  // This file is part of www.nand2tetris.org
  // and the book "The Elements of Computing Systems"
  // by Nisan and Schocken, MIT Press.
  // File name: projects/12/Sys.jack
  
  /**
   * A library of basic system services.
   */
  class Sys {
  
      /** Performs all the initializations required by the OS. */
      function void init() {
          // Initialize OS services
          do Memory.init();
          do Math.init();
          do Screen.init();
          do Output.init();
          do Keyboard.init();
          // Call the main program
          do Main.main();
          while (true) {
  
          }
          return;
      }
  
      /** Halts execution. */
      function void halt() {
          while (true) {
          }
          return;
      }
  
      /** Waits approximately duration milliseconds and then returns. */
      function void wait(int duration) {
          var int counter1, counter2, counter3;
          // reduce to seconds
          let duration = duration / 1000;
          let counter1 = 0;
          while (counter1 < 10000) {
              let counter2 = 0;
              while (counter2 < 10) {
                  let counter3 = 0;
                  while (counter3 < duration) {
                      let counter3 = counter3 + 1;
                  }
                  let counter2 = counter2 + 1;
              }
              let counter1 = counter1 + 1;
          }
          return;
      }
  
      /** Prints the given error code in the form "ERR<errorCode>", and halts. */
      function void error(int errorCode) {
          do Output.printString("ERR");
          do Output.printInt(errorCode);
          return;
      }
  }    
  `;
};

export const Output = () => {
  return `
  // This file is part of www.nand2tetris.org
  // and the book "The Elements of Computing Systems"
  // by Nisan and Schocken, MIT Press.
  // File name: projects/12/Output.jack
  
  /**
   * Handles writing characters to the screen.
   * The text screen (256 columns and 512 roes) is divided into 23 text rows (0..22), 
   * each containing 64 text columns (0..63).
   * Each row is 11 pixels high (including 1 space pixel), and 8 pixels wide
   * (including 2 space pixels).
   */
  class Output {
  
      // Character map for printing on the left of a screen word
      static Array charMaps; 
      // current column of the cursor
      static int cursorCol;
      // current row of the cursor
      static int cursorRow;
      // the screen supports only 23 lines
      static int MAX_ROW;
      // the screen supports only 64 columns
      static int MAX_COL;
      // char width is 8 pixels
      static int CHAR_WIDTH;
      // char height is 11 pixels
      static int CHAR_HEIGHT;
      // there is a spacing of 2 pixels
      static int SPACING;
      // powers of two array to be used as a mask
      static Array twoToThe;
  
      /** Initializes the screen and locates the cursor at the screen's top-left. */
      function void init() {
          var int i, powOf2;
          let cursorRow = 0;
          let cursorCol = 0;
          let MAX_ROW = 22;
          let MAX_COL = 63;
          let CHAR_WIDTH = 8;
          let CHAR_HEIGHT = 11;
          let SPACING = 2;
          // populate the twoToThe array
          let i = 0;
          let powOf2 = 1;
          let twoToThe = Array.new(CHAR_WIDTH - SPACING);
          while (i < (CHAR_WIDTH - SPACING)) {
              let twoToThe[i] = powOf2;
              let powOf2 = 2 * powOf2;
              let i = i + 1;
          }
          do Output.initMap();
          return;
      }
  
      // Initalizes the character map array
      function void initMap() {
          var int i;
      
          let charMaps = Array.new(127);
          
          // black square (used for non printable characters)
          do Output.create(0,63,63,63,63,63,63,63,63,63,0,0);
  
          // Assigns the bitmap for each character in the charachter set.
          do Output.create(32,0,0,0,0,0,0,0,0,0,0,0);          //
          do Output.create(33,12,30,30,30,12,12,0,12,12,0,0);  // !
          do Output.create(34,54,54,20,0,0,0,0,0,0,0,0);       // "
          do Output.create(35,0,18,18,63,18,18,63,18,18,0,0);  // #
          do Output.create(36,12,30,51,3,30,48,51,30,12,12,0); // $
          do Output.create(37,0,0,35,51,24,12,6,51,49,0,0);    // %
          do Output.create(38,12,30,30,12,54,27,27,27,54,0,0); // &
          do Output.create(39,12,12,6,0,0,0,0,0,0,0,0);        // '
          do Output.create(40,24,12,6,6,6,6,6,12,24,0,0);      // (
          do Output.create(41,6,12,24,24,24,24,24,12,6,0,0);   // )
          do Output.create(42,0,0,0,51,30,63,30,51,0,0,0);     // *
          do Output.create(43,0,0,0,12,12,63,12,12,0,0,0);     // +
          do Output.create(44,0,0,0,0,0,0,0,12,12,6,0);        // ,
          do Output.create(45,0,0,0,0,0,63,0,0,0,0,0);         // -
          do Output.create(46,0,0,0,0,0,0,0,12,12,0,0);        // .    
          do Output.create(47,0,0,32,48,24,12,6,3,1,0,0);      // /
          
          do Output.create(48,12,30,51,51,51,51,51,30,12,0,0); // 0
          do Output.create(49,12,14,15,12,12,12,12,12,63,0,0); // 1
          do Output.create(50,30,51,48,24,12,6,3,51,63,0,0);   // 2
          do Output.create(51,30,51,48,48,28,48,48,51,30,0,0); // 3
          do Output.create(52,16,24,28,26,25,63,24,24,60,0,0); // 4
          do Output.create(53,63,3,3,31,48,48,48,51,30,0,0);   // 5
          do Output.create(54,28,6,3,3,31,51,51,51,30,0,0);    // 6
          do Output.create(55,63,49,48,48,24,12,12,12,12,0,0); // 7
          do Output.create(56,30,51,51,51,30,51,51,51,30,0,0); // 8
          do Output.create(57,30,51,51,51,62,48,48,24,14,0,0); // 9
          
          do Output.create(58,0,0,12,12,0,0,12,12,0,0,0);      // :
          do Output.create(59,0,0,12,12,0,0,12,12,6,0,0);      // ;
          do Output.create(60,0,0,24,12,6,3,6,12,24,0,0);      // <
          do Output.create(61,0,0,0,63,0,0,63,0,0,0,0);        // =
          do Output.create(62,0,0,3,6,12,24,12,6,3,0,0);       // >
          do Output.create(64,30,51,51,59,59,59,27,3,30,0,0);  // @
          do Output.create(63,30,51,51,24,12,12,0,12,12,0,0);  // ?
  
          do Output.create(65,12,30,51,51,63,51,51,51,51,0,0);          // A ** TO BE FILLED **
          do Output.create(66,31,51,51,51,31,51,51,51,31,0,0); // B
          do Output.create(67,28,54,35,3,3,3,35,54,28,0,0);    // C
          do Output.create(68,15,27,51,51,51,51,51,27,15,0,0); // D
          do Output.create(69,63,51,35,11,15,11,35,51,63,0,0); // E
          do Output.create(70,63,51,35,11,15,11,3,3,3,0,0);    // F
          do Output.create(71,28,54,35,3,59,51,51,54,44,0,0);  // G
          do Output.create(72,51,51,51,51,63,51,51,51,51,0,0); // H
          do Output.create(73,30,12,12,12,12,12,12,12,30,0,0); // I
          do Output.create(74,60,24,24,24,24,24,27,27,14,0,0); // J
          do Output.create(75,51,51,51,27,15,27,51,51,51,0,0); // K
          do Output.create(76,3,3,3,3,3,3,35,51,63,0,0);       // L
          do Output.create(77,33,51,63,63,51,51,51,51,51,0,0); // M
          do Output.create(78,51,51,55,55,63,59,59,51,51,0,0); // N
          do Output.create(79,30,51,51,51,51,51,51,51,30,0,0); // O
          do Output.create(80,31,51,51,51,31,3,3,3,3,0,0);     // P
          do Output.create(81,30,51,51,51,51,51,63,59,30,48,0);// Q
          do Output.create(82,31,51,51,51,31,27,51,51,51,0,0); // R
          do Output.create(83,30,51,51,6,28,48,51,51,30,0,0);  // S
          do Output.create(84,63,63,45,12,12,12,12,12,30,0,0); // T
          do Output.create(85,51,51,51,51,51,51,51,51,30,0,0); // U
          do Output.create(86,51,51,51,51,51,30,30,12,12,0,0); // V
          do Output.create(87,51,51,51,51,51,63,63,63,18,0,0); // W
          do Output.create(88,51,51,30,30,12,30,30,51,51,0,0); // X
          do Output.create(89,51,51,51,51,30,12,12,12,30,0,0); // Y
          do Output.create(90,63,51,49,24,12,6,35,51,63,0,0);  // Z
  
          do Output.create(91,30,6,6,6,6,6,6,6,30,0,0);          // 
          do Output.create(92,0,0,1,3,6,12,24,48,32,0,0);        // 
          do Output.create(93,30,24,24,24,24,24,24,24,30,0,0);   // 
          do Output.create(94,8,28,54,0,0,0,0,0,0,0,0);          // ^
          do Output.create(95,0,0,0,0,0,0,0,0,0,63,0);           // _
          do Output.create(96,6,12,24,0,0,0,0,0,0,0,0);          // 
  
          do Output.create(97,0,0,0,14,24,30,27,27,54,0,0);      // a
          do Output.create(98,3,3,3,15,27,51,51,51,30,0,0);      // b
          do Output.create(99,0,0,0,30,51,3,3,51,30,0,0);        // c
          do Output.create(100,48,48,48,60,54,51,51,51,30,0,0);  // d
          do Output.create(101,0,0,0,30,51,63,3,51,30,0,0);      // e
          do Output.create(102,28,54,38,6,15,6,6,6,15,0,0);      // f
          do Output.create(103,0,0,30,51,51,51,62,48,51,30,0);   // g
          do Output.create(104,3,3,3,27,55,51,51,51,51,0,0);     // h
          do Output.create(105,12,12,0,14,12,12,12,12,30,0,0);   // i
          do Output.create(106,48,48,0,56,48,48,48,48,51,30,0);  // j
          do Output.create(107,3,3,3,51,27,15,15,27,51,0,0);     // k
          do Output.create(108,14,12,12,12,12,12,12,12,30,0,0);  // l
          do Output.create(109,0,0,0,29,63,43,43,43,43,0,0);     // m
          do Output.create(110,0,0,0,29,51,51,51,51,51,0,0);     // n
          do Output.create(111,0,0,0,30,51,51,51,51,30,0,0);     // o
          do Output.create(112,0,0,0,30,51,51,51,31,3,3,0);      // p
          do Output.create(113,0,0,0,30,51,51,51,62,48,48,0);    // q
          do Output.create(114,0,0,0,29,55,51,3,3,7,0,0);        // r
          do Output.create(115,0,0,0,30,51,6,24,51,30,0,0);      // s
          do Output.create(116,4,6,6,15,6,6,6,54,28,0,0);        // t
          do Output.create(117,0,0,0,27,27,27,27,27,54,0,0);     // u
          do Output.create(118,0,0,0,51,51,51,51,30,12,0,0);     // v
          do Output.create(119,0,0,0,51,51,51,63,63,18,0,0);     // w
          do Output.create(120,0,0,0,51,30,12,12,30,51,0,0);     // x
          do Output.create(121,0,0,0,51,51,51,62,48,24,15,0);    // y
          do Output.create(122,0,0,0,63,27,12,6,51,63,0,0);      // z
          
          do Output.create(123,56,12,12,12,7,12,12,12,56,0,0);   // {
          do Output.create(124,12,12,12,12,12,12,12,12,12,0,0);  // |
          do Output.create(125,7,12,12,12,56,12,12,12,7,0,0);    // }
          do Output.create(126,38,45,25,0,0,0,0,0,0,0,0);        // ~
  
      return;
      }
  
      // Creates a character map array of the given char index with the given values.
      function void create(int index, int a, int b, int c, int d, int e, int f, int g, int h, int i, int j, int k) {
          var Array map;
  
          let map = Array.new(11);
          let charMaps[index] = map;
  
          let map[0] = a;
          let map[1] = b;
          let map[2] = c;
          let map[3] = d;
          let map[4] = e;
          let map[5] = f;
          let map[6] = g;
          let map[7] = h;
          let map[8] = i;
          let map[9] = j;
          let map[10] = k;
  
          return;
      }
      
      // Returns the character map (array of size 11) for the given character
      // If an invalid character is given, returns the character map of a black square.
      function Array getMap(char c) {
          
          if ((c < 32) | (c > 126)) {
              let c = 0;
          }
          
          return charMaps[c];
      }
  
      /** Moves the cursor to the j�th column of the i�th row,
       *  and erases the character that was there. */
      function void moveCursor(int i, int j) {
          let cursorRow = i;
          let cursorCol = j;
          if (cursorCol > MAX_COL) {
              let cursorCol = 0;
              let cursorRow = cursorRow + 1;
          }
          if (cursorRow > MAX_ROW) {
              let cursorRow = 0;
          }        
          if (cursorCol < 0) {
              let cursorCol = MAX_COL;
              let cursorRow = cursorRow - 1;
              if (cursorRow < 0) {
                  let cursorRow = 0;
              }
          }
          return;
      }
  
      /** Prints c at the cursor location and advances the cursor one
       *  column forward. */
      function void printChar(char c) {
          var Array charMap;
          var int i, j, x, y, rowValue;
          var boolean drawPixel;
          let charMap = Output.getMap(c);
          let i = 0;
          while (i < (CHAR_HEIGHT - SPACING)) {
              // calculate y coordinate
              let y = cursorRow * CHAR_HEIGHT + i;
              // calculate x coordinate
              let rowValue = charMap[i];
              let j = 0;
              while (j < (CHAR_WIDTH - SPACING)) {
                  let drawPixel = (rowValue & twoToThe[j]) = twoToThe[j];
                  if (drawPixel) {
                      do Screen.setColor(true);
                  } else {
                      do Screen.setColor(false);
                  }
                  let x = cursorCol * CHAR_WIDTH + j;
                  do Screen.drawPixel(x, y);
                  // increment j
                  let j = j + 1;
              }
              // increment i
              let i = i + 1;
          }
          do Output.moveCursor(cursorRow, cursorCol + 1);
          return;
      }
  
      /** Prints s starting at the cursor location, and advances the
       *  cursor appropriately. */
      function void printString(String s) {
          var int charIndex, length;
          let charIndex = 0;
          let length = s.length();
          while (charIndex < length) {
              do Output.printChar(s.charAt(charIndex));
              let charIndex = charIndex + 1;
          }
          return;
      }
  
      /** Prints i starting at the cursor location, and advances the
       *  cursor appropriately. */
      function void printInt(int i) {
          var String str;
          var int powOf10, digitCount;
          var boolan isNegative;
          let digitCount = 1;
          let isNegative = i < 0;
          if (isNegative) {
              let i = Math.abs(i);
          }
          if (i > 9)  {
              let powOf10 = 10;
              while (i > (powOf10 - 1)) {
                  let digitCount = digitCount + 1;
                  let powOf10 = 10 * powOf10;
              }
          }
          if (isNegative) {
              let digitCount = digitCount + 1;
              let i = -i;
          }
          let str = String.new(digitCount);
          do str.setInt(i);
          do Output.printString(str);
          return;
      }
  
      /** Advances the cursor to the beginning of the next line. */
      function void println() {
          do Output.moveCursor(cursorRow + 1, 0);
          return;
      }
  
      /** Moves the cursor one column back. */
      function void backSpace() {
          do Output.moveCursor(cursorRow, cursorCol - 1);
          return;
      }
  }    
  `;
};

export const Keyboard = () => {
  return `
  // This file is part of www.nand2tetris.org
  // and the book "The Elements of Computing Systems"
  // by Nisan and Schocken, MIT Press.
  // File name: projects/12/Keyboard.jack
  
  /**
   * A library for handling user input from the keyboard.
   */
  class Keyboard {
  
      static int KEYBOARD;
      static int LINE_LENGTH;
      static char CURSOR;
      static char NO_CHAR;
  
      /** Initializes the keyboard. */
      function void init() {
          let KEYBOARD = 24576;    
          let LINE_LENGTH = 64;
          let CURSOR = 124;
          let NO_CHAR = 0;
          return;
      } 
  
      /**
       * Returns the ASCII code (as char) of the currently pressed key,
       * or 0 if no key is currently pressed.
       * Recognizes all ASCII characters, as well as the following extension
       * of action keys:
       * New line = 128 = String.newline()
       * Backspace = 129 = String.backspace()
       * Left Arrow = 130
       * Up Arrow = 131
       * Right Arrow = 132
       * Down Arrow = 133
       * Home = 134
       * End = 135
       * Page Up = 136
       * Page Down = 137
       * Insert = 138
       * Delete = 139
       * ESC = 140
       * F1 - F12 = 141 - 152
       */
      function char keyPressed() {
          return Memory.peek(KEYBOARD);
      }
  
      /**								
       * Reads the next character from the keyboard.
       * waits until a key is pressed and then released, then echoes
       * the key to the screen, and returns the value of the pressed key.
       */
      function char readChar() {
          var char currentKey;
          // display the cursor
          do Output.printChar(CURSOR);
          // while no key is pressed on the keyboard, do nothing
          let currentKey = NO_CHAR;
          while (~currentKey) {
              let currentKey = Keyboard.keyPressed();
          }
          // while a key is pressed do nothing;
          while (Keyboard.keyPressed()) {
          }
          // erase the cursor
          do Output.backSpace();
          // print the character and move cursor to the right
          do Output.printChar(currentKey);
          // reset memory
          do Memory.poke(KEYBOARD, NO_CHAR);
          return currentKey;
      }
  
      /**								
       * Prints the message on the screen, reads the next line
       * (until a newline character) from the keyboard, and returns its value.
       */
      function String readLine(String message) {
          var String lineString;
          var char currentChar;
          var boolean loop;
          // print the message
          do Output.printString(message);
          // read the input
          let lineString = String.new(LINE_LENGTH);
          let loop = true;
          while (loop) {
              let currentChar = Keyboard.readChar();
              if (currentChar = String.newLine()) {
                  let loop = false;
                  do Output.println();
              } else {
                  if (currentChar = String.backSpace()) {
                      do Output.backSpace();
                      do lineString.eraseLastChar();
                  } else {
                      let lineString = lineString.appendChar(currentChar);
                  }
              }
          }    
          return lineString;
      }   
  
      /**								
       * Prints the message on the screen, reads the next line
       * (until a newline character) from the keyboard, and returns its
       * integer value (until the first non numeric character).
       */
      function int readInt(String message) {
          var String input;
          let input = Keyboard.readLine(message);
          return input.intValue();
      }
  }    
  `;
};

export const JackString = () => {
  return `
    // This file is part of www.nand2tetris.org
    // and the book "The Elements of Computing Systems"
    // by Nisan and Schocken, MIT Press.
    // File name: projects/12/String.jack
    
    /**
     * Represents a String object. Implements the String type.
     */
    class String {
    
        static int ZERO, NINE, HYPHEN;
        field int length, actualLength;
        field Array charArray;
    
        /** Constructs a new empty String with a maximum length of maxLength. */
        constructor String new(int maxLength) {
            let ZERO = 48;
            let NINE = 57;
            let HYPHEN = 45;
            let length = maxLength;
            let actualLength = 0;
            if (maxLength > 0) {
                let charArray = Array.new(maxLength);
            }
            return this;
        }
    
        /** De-allocates the charArray and frees its space. */
        method void dispose() {
            if (length > 0) {
                do charArray.dispose();
            }
            do Memory.deAlloc(this);
            return;
        }
    
        /** Returns the current length of this String. */
        method int length() {
            return actualLength;
        }
    
        /** Returns the character at location j. */
        method char charAt(int j) {
            return charArray[j];
        }
    
        /** Sets the j'th character of this charArray to be c. */
        method void setCharAt(int j, char c) {
            let charArray[j] = c;
            return;
        }
    
        /** Appends the character c to the end of this String.
         *  Returns this charArray as the return value. */
        method String appendChar(char c) {
            let charArray[actualLength] = c;
            let actualLength = actualLength + 1;
            return this;
        }
    
        /** Erases the last character from this String. */
        method void eraseLastChar() {
            let actualLength = actualLength - 1;
            return;
        }
    
        /** Returns the integer value of this String until the first non
         *  numeric character. */
        method int intValue() {
            var int i, value, currentChar;
            var boolean loop, isDigit, isNegative;
            let i = 0;
            let value = 0;
            // distinguish negative numbers
            if (charArray[0] = HYPHEN) {
                let isNegative = true;
                let i = i + 1;
            }
            let loop = true;
            while (loop) {
                let currentChar = charArray[i];
                // digit characters are between 47 and 58
                let isDigit = (currentChar > (ZERO - 1)) & (currentChar < (NINE + 1));
                if (isDigit) {
                    // remeber currentChar is an ascii code
                    let value = value * 10 + (currentChar - ZERO);
                    // increment i
                    let i = i + 1;
                    // loop only upto length
                    if (i = actualLength) {
                        let loop = false;
                    }                
                } else {
                    let loop = false;
                }
     
            }
            if (isNegative) {
                return -value;
            } else {
                return value;
            }
            
        }
    
        method void setPositiveInt(int number) {
            var int lastDigit, quotient, lastChar;
            let quotient = number / 10;
            let lastDigit = number - (10 * quotient);
            let lastChar = ZERO + lastDigit;
            if (number < 10) {
                do appendChar(lastChar);
            } else {
                do setPositiveInt(number / 10);
                do appendChar(lastChar);
            }
            return;
        }
    
        /** Sets this String to hold a representation of the given number. */
        method void setInt(int number) {
            let actualLength = 0;
            // handle negative numbers
            if (number < 0) {
                // put in the - symbol
                do appendChar(HYPHEN);
                // take the absolute value of the number
                let number = Math.abs(number);
            }        
            do setPositiveInt(number);
            return;
        }
    
        /** Returns the new line character. */
        function char newLine() {
            return 128;
        }
    
        /** Returns the backspace character. */
        function char backSpace() {
            return 129;
        }
    
        /** Returns the double quote (") character. */
        function char doubleQuote() {
            return 34;
        }
    }        
    `;
};

export const Screen = () => {
  return `
  // This file is part of www.nand2tetris.org
  // and the book "The Elements of Computing Systems"
  // by Nisan and Schocken, MIT Press.
  // File name: projects/12/Screen.jack
  
  /**
   * Graphic screen library.
   */
  class Screen {
  
      // screen pixel memory mapping starts at address 16384
      static int SCREEN_BASE;
      // screen mapping ends at
      static int SCREEN_LIMIT;
      // powers of two array to be used as a mask
      static Array twoToThe;
      // color
      static boolean color;
  
      static int rectOrCircLoc;
      static boolean isRectOrCirc;
  
      /** Initializes the Screen. */
      function void init() {
          var int i, powOf2;
          let SCREEN_BASE = 16384;
          let SCREEN_LIMIT = 24576;
          let color = true;
          let rectOrCircLoc = 0;
          let isRectOrCirc = false;
          // populate the twoToThe array
          let i = 0;
          let powOf2 = 1;
          let twoToThe = Array.new(16);
          while (i < 16) {
              let twoToThe[i] = powOf2;
              let powOf2 = 2 * powOf2;
              let i = i + 1;
          }
          return;
      }    
  
      /** Erases the whole screen. */
      function void clearScreen() {
          var int location;
          let location = SCREEN_BASE;
          while (location < SCREEN_LIMIT) {
              do Memory.poke(location, false);
              let location = location + 1;
          }
          return;
      }
  
      /** Sets the color to be used in further draw commands
       *  where white = false, black = true. */
      function void setColor(boolean b) {
          let color = b;
          return;
      }
  
      /** Draws the (x, y) pixel. */
      function void drawPixel(int x, int y) {
          var int value, memLocation, bitLocation, sixtnQuotientOfRow;
          if (isRectOrCirc) {
              let memLocation = rectOrCircLoc;
          } else {
              let sixtnQuotientOfRow = x / 16;
              // mem location = 16384 + r * 32 + c/16
              let memLocation = SCREEN_BASE + (y * 32) + sixtnQuotientOfRow;            
          }
          // get value at memory location
          let value = Memory.peek(memLocation);
          // bit location c%16
          let bitLocation = x & 15;
          // set the value at bit location        
          if (color) {
              // draw black
              let value = twoToThe[bitLocation] | value;
          } else {
              // draw whie
              let value = (~twoToThe[bitLocation]) & value;
          }
          // put value back to memLocation
          do Memory.poke(memLocation, value);
          return;
      }
  
      /** Draws a line from (x1, y1) to (x2, y2). */
      function void drawLine(int x1, int y1, int x2, int y2) {
          var int dx, dy, a, b, i, x, y, adyMinusbdx, temp, lineColor, memLocation, lastValue;
          var boolean isYMirrored, isXMirrored;
          let dx = x2 - x1;
          let dy = y2 - y1;
          let a = 0;
          let b = 0;
          if ((dx = 0) | (dy = 0)) {
              if (dx = 0) {
                  // draw a vertical line
                  if (y2 < y1) {
                      // we want to draw bottom to top
                      let temp = y1;
                      let y1 = y2;
                      let y2 = temp;
                  }
                  while (y1 < y2) {
                      let y1 = y1 + 1;
                      do Screen.drawPixel(x1, y1);
                  }
              } else {
                  // draw a horizontal line
                  if (x2 < x1) {
                      // we want to draw left to right
                      let temp = x1;
                      let x1 = x2;
                      let x2 = temp;
                  }        
                  let x = x1;
                  while (x1 < (x2 + 1)) {
                      if ((x1 & 15) = 0) {
                          // we are at a good point man, let's do some trick
                          if (isRectOrCirc & (x1 > x)) {
                              let memLocation = rectOrCircLoc + 1;
                          } else {
                              let memLocation = SCREEN_BASE + (y1 * 32) + (x1 / 16);
                          }
                          while ((x2 - x1) > 15) {
                              do Memory.poke(memLocation, color);
                              let x1 = x1 + 16;
                              let memLocation = memLocation + 1;
                          }
                          // the last pixel is not drawn, draw it here
                          let rectOrCircLoc = memLocation;
                          do Screen.drawPixel(x1, y1);
                      } else {
                          do Screen.drawPixel(x1, y1);
                      }
                      let x1 = x1 + 1;
  
                  }                
              }
              
          } else {
              let adyMinusbdx = 0;
              // do some mirroring, since the calculations that follow
              // assume a nice rising slope that runs from left to right
              if(y2 < y1) {
                  let isYMirrored = true;
                  let y1 = -y1;
                  let y2 = -y2;
              } else {
                  let isYMirrored = false;
              }
              if(x2 < x1) {
                  let isXMirrored = true;
                  let x1 = -x1;
                  let x2 = -x2;
              } else {
                  let isXMirrored = false;
              }        
              // recompute dx and dy
              let dx = x2 - x1 + 1;
              let dy = y2 - y1 + 1;    
              while ((a < dx) & (b < dy)) {
                  do Screen.drawPixel(x, y);
                  if (adyMinusbdx < 0) {
                      let a = a + 1;
                      let adyMinusbdx = adyMinusbdx + dy;
                      let x = x1 + a;
                      if (isXMirrored) {
                          let x = -x;
                      }
                  } else {
                      let b = b + 1;
                      let adyMinusbdx = adyMinusbdx - dx;
                      let y = y1 + b;    
                      if (isYMirrored) {
                          let y = -y;
                      }                      
                  }
                        
              }
          }
          return;
      }
  
      /** Draws a filled rectangle where the top left corner
       *  is (x1, y1) and the bottom right corner is (x2, y2). */
      function void drawRectangle(int x1, int y1, int x2, int y2) {
          var int line, height, y, leftEdgeLocation;
          let line = 0;
          let height = y2 - y1;
          // we are at a good point man, let's do some trick
          let leftEdgeLocation = SCREEN_BASE + (y1 * 32) + (x1 / 16);  
          let rectOrCircLoc = leftEdgeLocation;  
          let isRectOrCirc = true;    
          while (line < height) {
              let y = y1 + line;
              do Screen.drawLine(x1, y, x2, y);
              let leftEdgeLocation = leftEdgeLocation + 32;
              let rectOrCircLoc = leftEdgeLocation;
              let line = line + 1;
          }
          let isRectOrCirc = false;
          return;
      }
  
      /** Draws a filled circle of radius r around (cx, cy). */
      function void drawCircle(int cx, int cy, int r) {
          // limit radii to be at most 181, to avoid overflow
          var int x1, x2, y, rSquared, sqrtRsqrdMinDySqrd, dy, leftEdgeLocation, left, right;
          if (r > 181) {
              let r = 181;
          }
          // the plus one is not to avoid the attempt of drawing a dot
          // as a line, cases found at the extreme edges of a circle
          let dy = -r + 1;
          let rSquared = r * r;
          // -r + 1 is for the same reason of avoiding extreme edges of the circle
          let leftEdgeLocation = SCREEN_BASE + ((cy - r + 1) * 32) + (cx / 16);  
          // lift up the left edge since code adds 32 to elft edge, right at the start of 
          // the following while loop
          let leftEdgeLocation = leftEdgeLocation - 32;
          // the coordinate that is mapped to the left most of current memory location
          let left = cx - (cx & 15);
          // the coordiante that is mapped to the right most of current memory location
          let right = left + 16;
          let isRectOrCirc = true;            
          while ((dy > -r) & (dy < r )) {
              let sqrtRsqrdMinDySqrd = Math.sqrt(rSquared - (dy * dy));
              let x1 = cx - sqrtRsqrdMinDySqrd;
              let x2 = cx + sqrtRsqrdMinDySqrd;
              let y = cy + dy;
              // move left edge location to one line below
              let leftEdgeLocation = leftEdgeLocation + 32;
              // likewise update the tracker location
              let rectOrCircLoc = leftEdgeLocation;
              if(dy < 1) {
                  // update left only when drawing the top half of the circle
                  if(x1 < (left + 1)) {
                      let rectOrCircLoc = rectOrCircLoc - 1;
                      let left = left - 16;
                      let right = left + 16;
                  }
              } else {
                  // update right only when drawing the bottom half of the circle
                  if(x1 > right) {
                      let rectOrCircLoc = rectOrCircLoc + 1;
                      let right = right + 16;
                  }     
              }       
              // let next left edge value reflect the updated left location
              let leftEdgeLocation = rectOrCircLoc;               
              do Screen.drawLine(x1, y, x2, y);
              let dy = dy + 1;         
          }     
          let isRectOrCirc = false;
          return;
      }
  }   
  `;
};
