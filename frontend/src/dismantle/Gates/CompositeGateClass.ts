import Vector from 'dismantle/Common/Vector';
import {
  BuiltInGateWithGUI,
  Connection,
  ConnectionSet,
  DirtyGateAdapter,
  Gate,
  GateClass,
  HDLTokenizer,
  Node,
  PinInfo,
  SubBusListeningAdapter,
  SubNode,
} from 'dismantle/Gates/internal';
import Graph from 'dismantle/Utilities/Graph';

export class CompositeGateClass extends GateClass {
  public static INTERNAL_PIN_TYPE: number = 3;
  public static TRUE_NODE_INFO: PinInfo = new PinInfo('true', 16);
  public static FALSE_NODE_INFO: PinInfo = new PinInfo('false', 16);
  public static CLOCK_NODE_INFO: PinInfo = new PinInfo('clk', 1);

  public static getSubBus(pinName: string): Int8Array | null {
    let result: Int8Array | null = null;
    const bracketsPos: number = pinName.indexOf('[');
    if (bracketsPos >= 0) {
      result = new Int8Array(2);
      let num: string;
      const dotsPos: number = pinName.indexOf('..');
      if (dotsPos >= 0) {
        num = pinName.substring(bracketsPos + 1, dotsPos);
        result[0] = Number(num);
        num = pinName.substring(dotsPos + 2, pinName.indexOf(']'));
        result[1] = Number(num);
      } else {
        num = pinName.substring(bracketsPos + 1, pinName.indexOf(']'));
        result[0] = Number(num);
        result[1] = result[0];
      }
    }
    return result;
  }
  private static getSubBusAndCheck(
    input: HDLTokenizer,
    pinName: string,
    busWidth: number,
  ): Int8Array | null {
    let result: Int8Array | null = null;
    try {
      result = CompositeGateClass.getSubBus(pinName);
    } catch (ex) {
      input.HDLError(pinName + ' has an invalid sub bus specification');
    }
    if (result != null) {
      if (result[0] < 0 || result[1] < 0) {
        input.HDLError(pinName + ': negative bit numbers are illegal');
      } else {
        if (result[0] > result[1]) {
          input.HDLError(
            pinName + ': left bit number should be lower than the right one',
          );
        } else {
          if (result[1] >= busWidth) {
            input.HDLError(
              pinName + ': the specified sub bus is not in the bus range',
            );
          }
        }
      }
    }
    return result;
  }

  public internalPinsInfo: Vector;
  private partsList: Vector;
  private partsOrder: Int32Array;
  private connections: ConnectionSet;

  constructor(
    gateName: string,
    input: HDLTokenizer,
    inputPinsInfo: PinInfo[],
    outputPinsInfo: PinInfo[],
  ) {
    super(gateName, inputPinsInfo, outputPinsInfo);
    this.partsList = new Vector();
    this.internalPinsInfo = new Vector();
    this.connections = new ConnectionSet();
    this.isInputClocked = [];
    this.isOutputClocked = [];
    this.readParts(input);
    const graph: Graph = this.createConnectionsGraph();
    const topologicalOrder: any[] = graph.topologicalSort(this.partsList);
    if (graph.hasCircle()) {
      throw new Error('This chip has a circle in its parts connections');
    }
    this.partsOrder = new Int32Array(this.partsList.size());
    let counter: number = 0;
    for (const order of topologicalOrder) {
      if (order instanceof Number) {
        this.partsOrder[counter++] = Number(order);
      }
    }
    for (let i: number = 0; i < inputPinsInfo.length; i++) {
      this.isInputClocked[i] = !graph.pathExists(
        inputPinsInfo[i],
        outputPinsInfo,
      );
    }
    for (let i: number = 0; i < outputPinsInfo.length; i++) {
      this.isOutputClocked[i] = !graph.pathExists(
        inputPinsInfo,
        outputPinsInfo[i],
      );
    }
  }

  public getPinInfo(type: number, num: number): PinInfo | null {
    let result: PinInfo | null = null;
    if (type === CompositeGateClass.INTERNAL_PIN_TYPE) {
      if (num < this.internalPinsInfo.size()) {
        return this.internalPinsInfo.elementAt(num);
      }
    } else {
      result = super.getPinInfo(type, num);
    }
    return result;
  }

  public newInstance(): Gate {
    const inputNodes: Node[] = new Array<Node>(this.inputPinsInfo.length);
    const outputNodes: Node[] = new Array<Node>(this.outputPinsInfo.length);
    const internalNodes: Node[] = new Array<Node>(this.internalPinsInfo.size());
    const result: CompositeGate = new CompositeGate();
    const parts: Gate[] = new Array<Gate>(this.partsList.size());
    for (let i: number = 0; i < parts.length; i++) {
      parts[i] = (this.partsList.elementAt(i) as GateClass).newInstance();
      if (parts[i] instanceof BuiltInGateWithGUI) {
        (parts[i] as any).setParent(result);
      }
    }
    const sortedParts: Gate[] = new Array<Gate>(parts.length);
    for (let i: number = 0; i < parts.length; i++) {
      sortedParts[i] = parts[this.partsOrder[i]];
    }
    for (let i: number = 0; i < inputNodes.length; i++) {
      inputNodes[i] = new Node();
    }
    for (let i: number = 0; i < outputNodes.length; i++) {
      outputNodes[i] = new Node();
    }
    const adapter: DirtyGateAdapter = new DirtyGateAdapter(result);
    for (let i: number = 0; i < this.isInputClocked.length; i++) {
      if (!this.isInputClocked[i]) {
        (inputNodes[i] as any).addListener(adapter);
      }
    }
    const internalConnections: ConnectionSet = new ConnectionSet();
    let partNode: Node;
    const source: Node;
    let target: Node;
    let gateSubBus: Int8Array;
    let partSubBus: Int8Array;
    const connectionIter: Iterator<any> = this.connections.iterator();
    while (connectionIter.next()) {
      const connection: Connection = connectionIter.next() as any;
      gateSubBus = connection.getGateSubBus();
      partSubBus = connection.getPartSubBus();
      partNode = parts[connection.getPartNumber()].getNode(
        connection.getPartPinName(),
      ) as any;
      switch (connection.getType()) {
        case Connection.FROM_INPUT:
          this.connectGateToPart(
            inputNodes[connection.getGatePinNumber()],
            gateSubBus,
            partNode,
            partSubBus,
          );
          break;
        case Connection.TO_OUTPUT:
          this.connectGateToPart(
            partNode,
            partSubBus,
            outputNodes[connection.getGatePinNumber()],
            gateSubBus,
          );
          break;
        case Connection.TO_INTERNAL:
          target = null;
          if (partSubBus === null) {
            target = new Node();
          } else {
            target = new SubNode(partSubBus[0], partSubBus[1]);
          }
          partNode.addListener(target);
          internalNodes[connection.getGatePinNumber()] = target;
          break;
        case Connection.FROM_INTERNAL:
        case Connection.FROM_TRUE:
        case Connection.FROM_FALSE:
        case Connection.FROM_CLOCK:
          internalConnections.add(connection);
          break;
      }
    }
    connectionIter = internalConnections.iterator();
    let isClockParticipating: boolean = false;
    while (connectionIter.hasNext()) {
      let connection: Connection = <Connection>connectionIter.next();
      partNode = parts[connection.getPartNumber()].getNode(
        connection.getPartPinName(),
      );
      partSubBus = connection.getPartSubBus();
      gateSubBus = connection.getGateSubBus();
      source = null;
      switch (connection.getType()) {
        case Connection.FROM_INTERNAL:
          source = internalNodes[connection.getGatePinNumber()];
          if (partSubBus === null) {
            source.addListener(partNode);
          } else {
            let node: Node = new SubBusListeningAdapter(
              partNode,
              partSubBus[0],
              partSubBus[1],
            );
            source.addListener(node);
          }
          break;
        case Connection.FROM_TRUE:
          let subNode: SubNode = new SubNode(gateSubBus[0], gateSubBus[1]);
          subNode.set(Gate.TRUE_NODE.get());
          if (partSubBus === null) {
            partNode.set(subNode.get());
          } else {
            let node: Node = new SubBusListeningAdapter(
              partNode,
              partSubBus[0],
              partSubBus[1],
            );
            node.set(subNode.get());
          }
          break;
        case Connection.FROM_FALSE:
          subNode = new SubNode(gateSubBus[0], gateSubBus[1]);
          subNode.set(Gate.FALSE_NODE.get());
          if (partSubBus === null) {
            partNode.set(subNode.get());
          } else {
            let node: Node = new SubBusListeningAdapter(
              partNode,
              partSubBus[0],
              partSubBus[1],
            );
            node.set(subNode.get());
          }
          break;
        case Connection.FROM_CLOCK:
          partNode.set(Gate.CLOCK_NODE.get());
          Gate.CLOCK_NODE.addListener(partNode);
          isClockParticipating = true;
          break;
      }
    }
    if (isClockParticipating) {
      Gate.CLOCK_NODE.addListener(new DirtyGateAdapter(result));
    }
    result.init(inputNodes, outputNodes, internalNodes, sortedParts, this);
    return result;
  }

  private readParts(input: HDLTokenizer): void {
    let endOfParts: boolean = false;
    while (input.hasMoreTokens() && !endOfParts) {
      input.advance();
      if (
        input.getTokenType() === HDLTokenizer.TYPE_SYMBOL &&
        input.getSymbol() === '}'
      ) {
        endOfParts = true;
      } else {
        if (!(input.getTokenType() === HDLTokenizer.TYPE_IDENTIFIER)) {
          input.HDLError('A GateClass name is expected');
        }
        let partName: string = input.getIdentifier();
        let gateClass: GateClass = GateClass.getGateClass(partName, false);
        this.partsList.addElement(gateClass);
        this.isClocked = this.isClocked || gateClass.isClocked;
        let partNumber: number = this.partsList.size() - 1;
        input.advance();
        if (
          !(
            input.getTokenType() === HDLTokenizer.TYPE_SYMBOL &&
            input.getSymbol() === '('
          )
        ) {
          input.HDLError("Missing '('");
        }
        this.readPinNames(input, partNumber, partName);
        input.advance();
        if (
          !(
            input.getTokenType() === HDLTokenizer.TYPE_SYMBOL &&
            input.getSymbol() === ';'
          )
        ) {
          input.HDLError("Missing ';'");
        }
      }
    }
    if (!endOfParts) {
      input.HDLError("Missing '}'");
    }
    if (input.hasMoreTokens()) {
      input.HDLError("Expected end-of-file after '}'");
    }
    let hasSource: boolean[] = [];
    let connectionIter: java.util.Iterator = this.connections.iterator();
    while (connectionIter.hasNext()) {
      let connection: Connection = <Connection>connectionIter.next();
      if (connection.getType() === Connection.TO_INTERNAL) {
        hasSource[connection.getGatePinNumber()] = true;
      }
    }
    for (let i: number = 0; i < hasSource.length; i++) {
      if (!hasSource[i]) {
        input.HDLError(
          (<PinInfo>this.internalPinsInfo.elementAt(i)).name +
            ' has no source pin',
        );
      }
    }
  }

  private readPinNames(
    input: HDLTokenizer,
    partNumber: number,
    partName: string,
  ): void {
    let endOfPins: boolean = false;
    while (!endOfPins) {
      input.advance();
      if (!(input.getTokenType() === HDLTokenizer.TYPE_IDENTIFIER)) {
        input.HDLError('A pin name is expected');
      }
      const leftName: string = input.getIdentifier();
      input.advance();
      if (
        !(
          input.getTokenType() === HDLTokenizer.TYPE_SYMBOL &&
          input.getSymbol() === '='
        )
      ) {
        input.HDLError("Missing '='");
      }
      input.advance();
      if (!(input.getTokenType() === HDLTokenizer.TYPE_IDENTIFIER)) {
        input.HDLError('A pin name is expected');
      }
      const rightName: string = input.getIdentifier();
      this.addConnection(input, partNumber, partName, leftName, rightName);
      input.advance();
      if (
        input.getTokenType() === HDLTokenizer.TYPE_SYMBOL &&
        input.getSymbol() === ')'
      ) {
        endOfPins = true;
      } else {
        if (
          !(
            input.getTokenType() === HDLTokenizer.TYPE_SYMBOL &&
            input.getSymbol() === ','
          )
        ) {
          input.HDLError("',' or ')' are expected");
        }
      }
    }
  }

  private addConnection(
    input: HDLTokenizer,
    partNumber: number,
    partName: string,
    fullLeftName: string,
    fullRightName: string,
  ): void {
    const partGateClass: GateClass = this.partsList.elementAt(partNumber);
    let leftName: string;
    let rightName: string;
    let connectionType: number = 0;
    let bracketsPos: number = fullLeftName.indexOf('[');
    leftName =
      bracketsPos >= 0 ? fullLeftName.substring(0, bracketsPos) : fullLeftName;
    const leftType: number = partGateClass.getPinType(leftName);
    if (leftType === GateClass.UNKNOWN_PIN_TYPE) {
      input.HDLError(leftName + ' is not a pin in ' + partName);
    }
    const leftNumber: number = partGateClass.getPinNumber(leftName);
    const leftPinInfo: PinInfo | null = partGateClass.getPinInfo(
      leftType,
      leftNumber,
    );
    let leftWidth;
    let leftSubBus: Int8Array | null;
    if (leftPinInfo !== null) {
      leftSubBus = CompositeGateClass.getSubBusAndCheck(
        input,
        fullLeftName,
        leftPinInfo.width,
      );
      leftWidth =
        leftSubBus === null
          ? leftPinInfo.width
          : leftSubBus[1] - leftSubBus[0] + 1;
    } else {
      throw Error(`Inside addConnection, leftPinInfo is null`);
    }

    bracketsPos = fullRightName.indexOf('[');
    rightName =
      bracketsPos >= 0
        ? fullRightName.substring(0, bracketsPos)
        : fullRightName;
    let rightPinInfo: PinInfo | null;
    let rightNumber: number = 0;
    let rightType: number = GateClass.UNKNOWN_PIN_TYPE;
    let selfFittingWidth: boolean = false;
    if (rightName === CompositeGateClass.TRUE_NODE_INFO.name) {
      rightPinInfo = CompositeGateClass.TRUE_NODE_INFO;
      connectionType = Connection.FROM_TRUE;
      selfFittingWidth = true;
    } else {
      if (rightName === CompositeGateClass.FALSE_NODE_INFO.name) {
        rightPinInfo = CompositeGateClass.FALSE_NODE_INFO;
        connectionType = Connection.FROM_FALSE;
        selfFittingWidth = true;
      } else {
        if (rightName === CompositeGateClass.CLOCK_NODE_INFO.name) {
          rightPinInfo = CompositeGateClass.CLOCK_NODE_INFO;
          connectionType = Connection.FROM_CLOCK;
        } else {
          rightType = this.getPinType(rightName);
          if (
            (rightType === GateClass.UNKNOWN_PIN_TYPE ||
              rightType === CompositeGateClass.INTERNAL_PIN_TYPE) &&
            fullRightName !== rightName
          ) {
            input.HDLError(
              fullRightName + ': sub bus of an internal node may not be used',
            );
          }
          if (rightType === GateClass.UNKNOWN_PIN_TYPE) {
            rightType = CompositeGateClass.INTERNAL_PIN_TYPE;
            rightPinInfo = new PinInfo();
            rightPinInfo.name = rightName;
            rightPinInfo.width = leftWidth;
            this.internalPinsInfo.addElement(rightPinInfo);
            rightNumber = this.internalPinsInfo.size() - 1;
            this.registerPin(
              rightPinInfo,
              CompositeGateClass.INTERNAL_PIN_TYPE,
              rightNumber,
            );
          } else {
            rightNumber = this.getPinNumber(rightName);
            rightPinInfo = this.getPinInfo(rightType, rightNumber);
          }
        }
      }
    }
    if (rightPinInfo === null) {
      throw new Error(`In addConnection, rightPinInfo is null`);
    }
    let rightSubBus: Int8Array | null;
    let rightWidth: number;
    if (selfFittingWidth) {
      if (rightName !== fullRightName) {
        input.HDLError(rightName + ' may not be subscripted');
      }
      rightWidth = leftWidth;
      rightSubBus = new Int8Array([0, rightWidth - 1]);
    } else {
      rightSubBus = CompositeGateClass.getSubBusAndCheck(
        input,
        fullRightName,
        rightPinInfo.width,
      );
      rightWidth =
        rightSubBus === null
          ? rightPinInfo.width
          : rightSubBus[1] - rightSubBus[0] + 1;
    }
    if (rightSubBus === null) {
      throw new Error(`In addConnection, rightSubBus is null`);
    }
    if (leftWidth !== rightWidth) {
      input.HDLError(
        leftName +
          '(' +
          leftWidth +
          ') and ' +
          rightName +
          '(' +
          rightWidth +
          ') have different bus widths',
      );
    }
    if (
      rightType === CompositeGateClass.INTERNAL_PIN_TYPE &&
      leftType === GateClass.OUTPUT_PIN_TYPE
    ) {
      if (rightPinInfo.isInitialized(rightSubBus)) {
        input.HDLError(
          "An internal pin may only be fed once by a part's output pin",
        );
      } else {
        rightPinInfo.initialize(rightSubBus);
      }
    }
    if (
      rightType === GateClass.OUTPUT_PIN_TYPE &&
      leftType === GateClass.OUTPUT_PIN_TYPE
    ) {
      if (rightPinInfo.isInitialized(rightSubBus)) {
        input.HDLError(
          "An output pin may only be fed once by a part's output pin",
        );
      } else {
        rightPinInfo.initialize(rightSubBus);
      }
    }
    switch (leftType) {
      case GateClass.INPUT_PIN_TYPE:
        switch (rightType) {
          case GateClass.INPUT_PIN_TYPE:
            connectionType = Connection.FROM_INPUT;
            break;
          case CompositeGateClass.INTERNAL_PIN_TYPE:
            connectionType = Connection.FROM_INTERNAL;
            break;
          case GateClass.OUTPUT_PIN_TYPE:
            input.HDLError("Can't connect gate's output pin to part");
        }
        break;
      case GateClass.OUTPUT_PIN_TYPE:
        switch (rightType) {
          case GateClass.INPUT_PIN_TYPE:
            input.HDLError(
              "Can't connect part's output pin to gate's input pin",
            );
          case CompositeGateClass.INTERNAL_PIN_TYPE:
            connectionType = Connection.TO_INTERNAL;
            break;
          case GateClass.OUTPUT_PIN_TYPE:
            connectionType = Connection.TO_OUTPUT;
            break;
        }
        break;
    }
    if (leftSubBus === null) {
      throw new Error(`In addConnection, leftSubBus is null`);
    }
    const connection: Connection = new Connection(
      connectionType,
      rightNumber,
      partNumber,
      leftName,
      rightSubBus,
      leftSubBus,
    );
    this.connections.add(connection);
  }
  private createConnectionsGraph(): Graph {
    let graph: Graph = new Graph();
    let connectionIter: java.util.Iterator = this.connections.iterator();
    while (connectionIter.hasNext()) {
      let connection: Connection = <Connection>connectionIter.next();
      let part: number = new number(connection.getPartNumber());
      let gatePinNumber: number = connection.getGatePinNumber();
      switch (connection.getType()) {
        case Connection.TO_INTERNAL:
          if (this.isLegalFromPartEdge(connection, part)) {
            graph.addEdge(
              part,
              this.getPinInfo(
                CompositeGateClass.INTERNAL_PIN_TYPE,
                gatePinNumber,
              ),
            );
          }
          break;
        case Connection.FROM_INTERNAL:
          if (this.isLegalToPartEdge(connection, part)) {
            graph.addEdge(
              this.getPinInfo(
                CompositeGateClass.INTERNAL_PIN_TYPE,
                gatePinNumber,
              ),
              part,
            );
          }
          break;
        case Connection.TO_OUTPUT:
          if (this.isLegalFromPartEdge(connection, part)) {
            graph.addEdge(
              part,
              this.getPinInfo(GateClass.OUTPUT_PIN_TYPE, gatePinNumber),
            );
          }
          break;
        case Connection.FROM_INPUT:
          if (this.isLegalToPartEdge(connection, part)) {
            graph.addEdge(
              this.getPinInfo(GateClass.INPUT_PIN_TYPE, gatePinNumber),
              part,
            );
          }
          break;
        case Connection.FROM_TRUE:
          if (this.isLegalToPartEdge(connection, part)) {
            graph.addEdge(CompositeGateClass.TRUE_NODE_INFO, part);
          }
          break;
        case Connection.FROM_FALSE:
          if (this.isLegalToPartEdge(connection, part)) {
            graph.addEdge(CompositeGateClass.FALSE_NODE_INFO, part);
          }
          break;
        case Connection.FROM_CLOCK:
          if (this.isLegalToPartEdge(connection, part)) {
            graph.addEdge(CompositeGateClass.CLOCK_NODE_INFO, part);
          }
          break;
      }
    }
    for (let i: number = 0; i < this.partsList.size(); i++) {
      graph.addEdge(this.partsList, new number(i));
    }
    for (let i: number = 0; i < this.outputPinsInfo.length; i++) {
      graph.addEdge(this.outputPinsInfo[i], this.outputPinsInfo);
    }
    for (let i: number = 0; i < this.inputPinsInfo.length; i++) {
      graph.addEdge(this.inputPinsInfo, this.inputPinsInfo[i]);
    }
    return graph;
  }
  private isLegalToPartEdge(connection: Connection, part: number): boolean {
    let partGateClass: GateClass = <GateClass>(
      this.partsList.elementAt(part.intValue())
    );
    let partPinNumber: number = partGateClass.getPinNumber(
      connection.getPartPinName(),
    );
    return !partGateClass.isInputClocked[partPinNumber];
  }
  private isLegalFromPartEdge(connection: Connection, part: number): boolean {
    let partGateClass: GateClass = <GateClass>(
      this.partsList.elementAt(part.intValue())
    );
    let partPinNumber: number = partGateClass.getPinNumber(
      connection.getPartPinName(),
    );
    return !partGateClass.isOutputClocked[partPinNumber];
  }

  private connectGateToPart(
    sourceNode: Node,
    sourceSubBus: Int8Array,
    targetNode: Node,
    targetSubBus: Int8Array,
  ): void {
    const source: Node = sourceNode;
    let target: Node = targetNode;
    if (targetSubBus != null) {
      target = new SubBusListeningAdapter(
        target,
        targetSubBus[0],
        targetSubBus[1],
      );
    }
    if (sourceSubBus === null) {
      source.addListener(target);
    } else {
      const subNode: Node = new SubNode(sourceSubBus[0], sourceSubBus[1]);
      source.addListener(subNode);
      subNode.addListener(target);
    }
  }
}
