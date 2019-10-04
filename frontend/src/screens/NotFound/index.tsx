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
      code: ConvertToBinJack(),
      name: 'ConvertToBin.jack',
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
