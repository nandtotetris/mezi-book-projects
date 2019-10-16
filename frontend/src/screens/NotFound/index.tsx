import { Col, Layout, Row } from 'antd';
import UploadComponent from 'components/Upload/UploadComponent';
import {
  BallJack,
  BatJack,
  KeyboardMain,
  OutputMain,
  PongGameJack,
  PongMainJack,
  ScreenMain,
} from 'dismantle/Compiler/jackPrograms';
import {
  Array,
  JackString,
  Math,
  Memory,
  Output,
  Screen,
  Sys,
} from 'dismantle/Compiler/os';
import { OS } from 'dismantle/JACK/OS';
import { OsTest } from 'dismantle/JACK/OsTest';
import { testJackCompiler } from 'dismantle/test';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';

interface IProps extends RouteComponentProps {}

const onFileChange = (content: string) => {
  // tslint:disable-next-line: no-console
  console.log(`Content is: ${content}`);
};

const NotFound: React.FunctionComponent<IProps> = ({ location }) => {
  // assemble();
  // translateVM();
  // testTokenizr();
  // testJackTokenizer(ArrayTestMainJack);
  // testCompilationEngine(SquareGameJack());
  const osSources = [
    {
      code: Array(),
      name: 'Array.vm',
    },
    {
      code: Memory(),
      name: 'Memory.vm',
    },
    {
      code: OS.Keyboard,
      name: 'Keyboard.vm',
    },
    {
      code: OS.Output,
      name: 'Output.vm',
    },
    {
      code: Screen(),
      name: 'Screen.vm',
    },
    {
      code: Math(),
      name: 'Math.vm',
    },
    {
      code: JackString(),
      name: 'String.vm',
    },
    {
      code: Sys(),
      name: 'Sys.vm',
    },
  ];
  const PongSource = [
    { code: BallJack(), name: 'Ball.vm' },
    { code: BatJack(), name: 'Bat.vm' },
    { code: PongGameJack(), name: 'PongGame.vm' },
    { code: PongMainJack(), name: 'Main.vm' },
  ];
  const TestSource = [{ code: OsTest.KeyboardTest, name: 'Main.vm' }];
  testJackCompiler([
    {
      code: OS.Output,
      name: 'Output.vm',
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
