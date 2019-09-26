import { Col, Layout, Row } from 'antd';
import UploadComponent from 'components/Upload/UploadComponent';
import CompilationEngine from 'dismantle/Compiler/CompilationEngine';
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
  // tslint:disable-next-line: no-console
  console.log(engine.getXmlOutput());
};

const NotFound: React.FunctionComponent<IProps> = ({ location }) => {
  // assemble();
  // translateVM();
  // testTokenizr();
  // testJackTokenizer(ArrayTestMainJack);
  testCompilationEngine(SquareJack);
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
