import { Modal } from 'antd';
import { ModalProps } from 'antd/lib/modal';
import * as React from 'react';

import cross from '-!svg-react-loader!assets/icons/cross.svg';
const Cross: any = cross;

/**
 * @props
 */
interface IProps extends ModalProps {
  onClose?: () => void;
}

/**
 * @state
 *
 * error
 */
interface IState {}

/**
 * @class Submit
 *
 */
class Default extends React.PureComponent<IProps, IState> {
  handleClose: () => void;
  constructor(props: any) {
    super(props);

    this.handleClose = this.close.bind(this);
  }

  close() {
    const { onClose } = this.props;
    onClose && onClose();
  }

  render() {
    const { children, onClose, ...rest } = this.props;

    return (
      <Modal closable={false} {...rest}>
        <>
          <div onClick={this.handleClose} className="close-popin-btn">
            <Cross color="white" className="close-popin-icon" />
          </div>
          {children}
        </>
      </Modal>
    );
  }
}

export default Default;
