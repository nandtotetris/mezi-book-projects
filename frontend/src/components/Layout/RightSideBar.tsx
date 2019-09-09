import * as React from 'react';
import { InjectedIntlProps, injectIntl } from 'react-intl';

import cross from '-!svg-react-loader!assets/icons/cross.svg';
const Cross: any = cross;

interface IProps extends InjectedIntlProps {
  children?: React.ReactNode;
  sidebar?: React.ReactNode;
  closable?: boolean;
  onClose?: () => void;
  style?: any;
}
interface IState {
  sidebar?: React.ReactNode;
  sidebarVisible: boolean;
}

class RightSideBar extends React.PureComponent<IProps, IState> {
  static defaultProps = {
    closable: true,
  };

  static getDerivedStateFromProps(props: IProps, state: IState) {
    if (props.sidebar !== state.sidebar) {
      if (props.sidebar) {
        return {
          sidebar: props.sidebar,
          sidebarVisible: true,
        };
      } else {
        return {
          sidebar: props.sidebar,
          sidebarVisible: false,
        };
      }
    }
    return null;
  }
  state = {
    sidebar: null,
    sidebarVisible: false,
  };

  handleClose: () => void;
  constructor(props: any) {
    super(props);

    this.handleClose = this.close.bind(this);
  }

  close() {
    const { onClose } = this.props;
    if (onClose) {
      onClose();
    } else {
      this.setState({ sidebarVisible: false });
    }
  }

  render() {
    const { children, intl, closable, style } = this.props;
    const { sidebar, sidebarVisible } = this.state;

    return (
      <div
        style={{
          display: 'flex',
        }}
      >
        <div
          style={{
            flex: 1,
          }}
        >
          {children}
        </div>
        <div
          style={sidebar ? style : undefined}
          className={`${
            sidebarVisible ? 'open' : 'close'
          } RightSideBar_sidebar-right`}
        >
          <div className="RightSideBar_sidebar-right-inner">
            {closable && (
              <div
                title={intl.formatMessage({
                  id: 'right_sidebar.btn.close',
                })}
                onClick={this.handleClose}
                className="close-sidebar-right"
              >
                <Cross color="#0053FA" />
              </div>
            )}
            {sidebar}
          </div>
        </div>
      </div>
    );
  }
}

export default injectIntl(RightSideBar);
