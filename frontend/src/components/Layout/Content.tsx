import { Layout } from 'antd';
import * as React from 'react';

const { Content } = Layout;

interface IProps {
  children?: React.ReactNode;
  style?: React.CSSProperties;
  reverse?: boolean;
  className?: string;
  footer?: React.ReactNode;
}

class Wrapper extends React.PureComponent<IProps, {}> {
  render() {
    const { children, style, reverse, className, footer } = this.props;

    return (
      <Content
        className={`${className ? `${className} ` : ''}${
          reverse ? ' content-reverse' : ' content-primary'
        }${footer ? ' content-with-footer' : ''}`}
        style={style}
      >
        {children}
        {footer}
      </Content>
    );
  }
}

export default Wrapper;
