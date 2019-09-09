import { Col, Layout, Row } from 'antd';
import Header from 'components/Header';

import { MainSidebar, ProfileSidebar } from 'components/Sidebar';
import { LayoutSkeletonType } from 'components/Skeleton/Layout';
import * as React from 'react';

export interface IConnectedLayoutOptions {
  sidebar?: boolean;
  subSidebar?: boolean;
  type?: LayoutSkeletonType;
}

interface IProps extends IConnectedLayoutOptions {
  children: React.ReactNode;
}

interface IProps {}

class ConnectedLayout extends React.PureComponent<IProps> {
  static defaultProps = {
    sidebar: true,
    subSidebar: false,
  };

  componentDidMount() {
    const zeSnippet = document.querySelector('#ze-snippet');
    if (!zeSnippet) {
      const script = document.createElement('script');
      script.id = 'ze-snippet';
      script.src =
        'https://static.zdassets.com/ekr/snippet.js?key=9ebb1afa-5a9e-496f-a9a9-ee9f7fb7d0df';

      (document as any).head.appendChild(script);
    }
  }

  render() {
    const { children, subSidebar, sidebar } = this.props;

    return (
      <Layout className="connected-layout">
        <Header authenticated={true} />
        <Layout>
          <Row
            style={{
              background: '#fff',
              display: 'flex',
              height: '100%',
              width: '100%',
            }}
          >
            {sidebar && <MainSidebar />}
            {subSidebar && <ProfileSidebar />}
            <Col
              style={{
                minHeight: 'calc(100vh - 64px)',
                width: '100%',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  minHeight: '100%',
                }}
              >
                {children}
              </div>
            </Col>
          </Row>
        </Layout>
      </Layout>
    );
  }
}

export default React.memo(ConnectedLayout);
