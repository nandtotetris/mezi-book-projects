// tslint:disable-next-line: interface-name
export default interface DirtyGateListener {
  gotDirty(): void;
  gotClean(): void;
}
