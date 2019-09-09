import { Avatar, Card } from 'antd';
import { CardProps } from 'antd/lib/card';
import { Icon } from 'components/Assets';
import { IconValue } from 'components/Assets/Icon';
import * as React from 'react';

/**
 * @props
 */
interface IProps extends CardProps {
  center?: boolean;
  avatar?: React.ReactNode | string;
  onClose?: () => void;
  editable?: boolean;
  onEdit?: () => void;
  removable?: boolean;
  onRemove?: () => void;
  shadow?: boolean;
  primary?: boolean;
  title?: React.ReactNode;
  titleAlign?: 'left' | 'right';
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
  onRemove = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    const { onRemove } = this.props;
    onRemove && onRemove();
  };

  render() {
    const {
      avatar,
      center,
      children,
      className,
      onClose,
      editable,
      onEdit,
      removable,
      shadow,
      title,
      primary,
      titleAlign,
      ...rest
    } = this.props;

    return (
      <Card
        className={`card-item${center ? ' center ' : ''}${
          shadow ? ' shadow ' : ''
        }${primary ? ' primary ' : ''}${className ? ` ${className}` : ''}`}
        {...rest}
      >
        {onClose && (
          <div onClick={onClose} className="card-close">
            <Icon value={IconValue.Cross} />
          </div>
        )}
        {editable && (
          <div onClick={onEdit} className="card-edit">
            <Icon value={IconValue.Pencil} />
          </div>
        )}
        {removable && (
          <div onClick={this.onRemove} className="card-remove">
            <Icon value={IconValue.Trash} />
          </div>
        )}
        {avatar && <Avatar className="card-avatar">{avatar}</Avatar>}
        {title && (
          <div className={`card-title${titleAlign ? ` ${titleAlign}` : ''}`}>
            {title}
          </div>
        )}
        <div className="card-children">{children}</div>
      </Card>
    );
  }
}

export default Default;
