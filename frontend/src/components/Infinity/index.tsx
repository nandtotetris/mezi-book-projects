import { Loading } from 'components/Loading';
import * as React from 'react';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import './Styles.module.less';

interface IProps extends InjectedIntlProps {
  className?: string;
  useWindow?: boolean;
  hasMore?: boolean;
  loadMore?: (more: any) => Promise<void>;
}

interface IState {
  loading?: boolean;
}

class Infinity extends React.PureComponent<IProps, IState> {
  static defaultProps = {};

  state = {
    loading: false,
  };

  scrollRef: any;

  more = async (more?: number) => {
    const { hasMore } = this.props;

    if (hasMore) {
      this.setState({ loading: true });
      if (this.props.loadMore) {
        await this.props.loadMore(more);
      }
      this.setState({ loading: false });
    }
  };
  handleRef = (node: React.ReactNode) => {
    if (node) {
      this.scrollRef = node;
      this.scrollRef.addEventListener('scroll', (e: any) => {
        const { loading } = this.state;

        if (
          !loading &&
          this.scrollRef &&
          this.scrollRef.offsetHeight + this.scrollRef.scrollTop >=
            this.scrollRef.scrollHeight
        ) {
          this.more();
        }
      });
    }
  };

  render() {
    const { children, hasMore, useWindow } = this.props;
    const { loading } = this.state;

    return (
      children && (
        <div
          ref={this.handleRef}
          className={`infinity${useWindow === false ? '' : ' use-window'}`}
        >
          {children}
          {hasMore && loading ? <Loading key="loading" /> : null}
        </div>
      )
    );
  }
}

export default injectIntl(Infinity);
