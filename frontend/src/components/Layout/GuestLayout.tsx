import { Layout } from 'antd';
import Header from 'components/Header';
import * as React from 'react';

interface IProps {
  children: React.ReactNode;
}

const GuestLayout: React.FunctionComponent<IProps> = ({ children }) => (
  <Layout className="guest-layout">
    <Header authenticated={false} />
    <Layout
      className="content-primary"
      style={{
        backgroundColor: '#fff',
        padding: 0,
      }}
    >
      {children}
    </Layout>
  </Layout>
);

export default React.memo(GuestLayout);
