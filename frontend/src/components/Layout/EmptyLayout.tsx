import { Layout } from 'antd';
import * as AlertCtx from 'context/Alert';
import * as React from 'react';

const { Content } = Layout;

interface IProps extends AlertCtx.InjectedProps {
  children: React.ReactNode;
  className?: string;
}

interface IProps {}

class EmptyLayout extends React.PureComponent<IProps> {
  // componentDidMount() {
  //   const zeSnippet = document.querySelector('#ze-snippet');
  //   if (!zeSnippet) {
  //     const script = document.createElement('script');
  //     script.id = 'ze-snippet';
  //     script.src =
  //       'https://static.zdassets.com/ekr/snippet.js?key=9ebb1afa-5a9e-496f-a9a9-ee9f7fb7d0df';

  //     (document as any).head.appendChild(script);
  //   }
  // }

  render() {
    const { children, className } = this.props;

    return (
      <Layout className={className}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {children}
        </div>
      </Layout>
    );
  }
}

export default React.memo(AlertCtx.hoc()(EmptyLayout));
