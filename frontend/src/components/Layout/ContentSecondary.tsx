import { Layout } from 'antd';
import * as React from 'react';
import './ContentSecondary.module.less';

const { Content } = Layout;

interface IProps {
  children?: React.ReactNode;
  className?: string;
}

class Wrapper extends React.PureComponent<IProps, {}> {
  render() {
    const { children, className } = this.props;

    return (
      <Content
        className={`${className ? `${className} ` : ''}content-secondary`}
      >
        {children}
      </Content>
    );
  }
}

export default Wrapper;
