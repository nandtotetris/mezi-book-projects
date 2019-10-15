import ExtendedCompilationEngine from 'dismantle/Compiler/ExtendedCompilationEngine';

export interface ISource {
  name: string;
  code: string;
}
/**
 * The compiler operates on a given source, where source
 * is either a file name of the form Xxx.jack or a directory name
 *  containing one or more such files. For each Xxx . jack input file,
 * the compiler creates a JackTokenizer and an output Xxx.vm file. Next,
 * the compiler uses the CompilationEngine, SymbolTable, and VMWriter modules
 * to write the output file.
 */
class JackCompiler {
  private soruces: ISource[];
  constructor(sources: ISource[]) {
    this.soruces = sources;
  }

  /**
   * Compiles jack class files into corresponding/equivalent vm files
   */
  public compile(): ISource[] {
    let compilerEngine: ExtendedCompilationEngine;
    const results: ISource[] = [];
    for (const source of this.soruces) {
      compilerEngine = new ExtendedCompilationEngine(source.code);
      results.push({ name: source.name, code: compilerEngine.getOutput() });
    }
    return results;
  }
}
export default JackCompiler;
