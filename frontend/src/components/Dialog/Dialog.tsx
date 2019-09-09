import { Modal } from 'antd';
import { ModalProps } from 'antd/lib/modal';
import { Icon } from 'components/Assets';
import { IconValue } from 'components/Assets/Icon';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import './Styles.module.less';

/**
 * @props
 */
export interface IDialogProps extends ModalProps {
  invoiceId?: string;
  description?: string;
  icon?: IconValue;
  img?: any;
  link?: string;
  linkTitle?: string;
  title?: string;
  footerIcon?: IconValue;
  footerTitle?: string;
  footerVisible?: boolean;
  footerClick?: () => void;
}

const Dialog: React.FunctionComponent<IDialogProps> = ({
  children,
  title,
  closable,
  description,
  img,
  icon,
  link,
  linkTitle,
  onCancel,
  className,
  footerVisible = true,
  footerIcon,
  footerTitle,
  footerClick,
  ...rest
}) => {
  return (
    <Modal
      closable={false}
      className={`dialog${className ? ` ${className}` : ''}`}
      title={
        title && (
          <>
            {icon && <Icon value={icon} />}
            <FormattedMessage id={title} />
          </>
        )
      }
      footer={null}
      {...rest}
    >
      {closable && (
        <div onClick={onCancel} className="close-dialog">
          <Icon value={IconValue.Cross} />
        </div>
      )}
      {img && <div className="img-dialog">{img}</div>}
      {description && (
        <div className="description-dialog">
          <FormattedMessage id={description} />
        </div>
      )}
      <div className="body-dialog">
        {children}
        {linkTitle && link && (
          <div className="ant-btn ant-btn-primary">
            <Link to={link}>
              <FormattedMessage id={linkTitle} />
            </Link>
          </div>
        )}
      </div>
      {footerVisible && (
        <div onClick={footerClick || onCancel} className="later-dialog">
          {footerIcon !== null && (
            <Icon value={footerIcon || IconValue.TimeReverse} />
          )}
          <FormattedMessage id={footerTitle || 'dialog.footer.do_it_later'} />
        </div>
      )}
    </Modal>
  );
};

export default Dialog;
