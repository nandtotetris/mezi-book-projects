export interface Strategy {
  loadFile(pathToFile: string): void;
  getData(): Promise<any>;
}
