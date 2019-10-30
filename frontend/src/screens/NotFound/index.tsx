import { Col, Layout, Row } from 'antd';
import UploadComponent from 'components/Upload/UploadComponent';
import { OS } from 'dismantle/JACK/OS';
import { OsTest } from 'dismantle/JACK/OsTest';
import { Pong } from 'dismantle/JACK/Sample/pong';
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
      code: OS.Array,
      name: 'Array.vm',
    },
    {
      code: OS.Memory,
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
      code: OS.Screen,
      name: 'Screen.vm',
    },
    {
      code: OS.Math,
      name: 'Math.vm',
    },
    {
      code: OS.JackString,
      name: 'String.vm',
    },
    {
      code: OS.Sys,
      name: 'Sys.vm',
    },
  ];
  const testSources: any = {
    array: [{ code: OsTest.ArrayTest, name: 'Main.vm' }],
    keyboard: [{ code: OsTest.KeyboardTest, name: 'Main.vm' }],
    math: [{ code: OsTest.MathTest, name: 'Main.vm' }],
    memory: [{ code: OsTest.MemoryTest, name: 'Main.vm' }],
    output: [{ code: OsTest.OutputTest, name: 'Main.vm' }],
    pong: [
      { code: Pong.Ball, name: 'Ball.vm' },
      { code: Pong.Bat, name: 'Bat.vm' },
      { code: Pong.PongGame, name: 'PongGame.vm' },
      { code: Pong.Main, name: 'Main.vm' },
    ],
    screen: [{ code: OsTest.ScreenTest, name: 'Main.vm' }],
    string: [{ code: OsTest.StringTest, name: 'Main.vm' }],
    sys: [{ code: OsTest.SysTest, name: 'Main.vm' }],
  };
  // keyboard, screen, and sys not tested yet
  testJackCompiler([...osSources, ...testSources.string]);
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
