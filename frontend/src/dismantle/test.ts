import CompilationEngine from 'dismantle/Compiler/CompilationEngine';
import ExtendedCompilationEngine from 'dismantle/Compiler/ExtendedCompilationEngine';
import JackCompiler, { ISource } from 'dismantle/Compiler/JackCompiler';
import JackTokenizer from 'dismantle/Compiler/JackTokenizer';
import HackAssemblerTranslator from 'dismantle/Translator/HackAssemblerTranslator';
import Definitions from 'dismantle/Utilities/Definitions';
import VMTranslator from 'dismantle/VMTranslator/VMTranslator';
import fileDownload from 'js-file-download';
import Tokenizr from 'tokenizr';

export const assemble = () => {
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

export const translateVM = () => {
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

export const testTokenizr = () => {
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

export const testJackTokenizer = (source: string) => {
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

export const testCompilationEngine = (source: string) => {
  const engine: CompilationEngine = new CompilationEngine(source, '');
  const extendedEngine: ExtendedCompilationEngine = new ExtendedCompilationEngine(
    source,
    '',
  );
  // tslint:disable-next-line: no-console
  console.log(extendedEngine.getOutput());
};

export const testJackCompiler = (sources: ISource[]) => {
  const compiler: JackCompiler = new JackCompiler(sources);
  const results: ISource[] = compiler.compile();
  for (const result of results) {
    fileDownload(result.code, result.name);
  }
};
