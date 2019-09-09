import { Alert } from 'antd';
import { AlertProps } from 'antd/lib/alert';
import { Icon } from 'components/Assets';
import { IconValue } from 'components/Assets/Icon';
import * as AlertCtx from 'context/Alert';
import { IAlert } from 'context/Alert/types';
import * as React from 'react';

/**
 * @props
 */
export interface IAlertProps extends AlertProps, AlertCtx.InjectedProps {
  background?: boolean;
  className?: string;
  alertItem: IAlert;
  floating?: boolean;
}

/**
 * @state
 */
interface IState {}

/**
 * @class Alert
 */
class Default extends React.PureComponent<IAlertProps, IState> {
  handleClose: () => void;
  constructor(props: any) {
    super(props);

    this.handleClose = this.close.bind(this);
  }

  close() {
    const { alertItem, alert } = this.props;
    alert && alert.dismiss(alertItem);
  }

  componentDidMount() {
    const { alertItem } = this.props;
    alertItem.dismiss && setTimeout(this.handleClose, 4000);
  }

  render() {
    const {
      type,
      message,
      background,
      className,
      closable,
      floating,
    } = this.props;

    return (
      <Alert
        className={`alert-custom ${floating ? 'floating' : ''}${
          background ? ' background' : ''
        }${className ? ` ${className}` : ''}`}
        message={message}
        type={type}
        closable={false}
        closeText={
          closable && (
            <Icon
              value={IconValue.Cross}
              onClick={this.handleClose}
              color="white"
              style={{
                height: '10px',
                verticalAlign: 'inherit',
                width: '10px',
              }}
            />
          )
        }
      />
    );
  }
}

export default AlertCtx.hoc()(Default);
