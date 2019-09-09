import { Button } from 'antd';
import { Div } from 'components/Typo';
import * as React from 'react';
import { Link } from 'react-router-dom';

export enum BtnType {
  Primary = 'primary',
  Danger = 'danger',
  Ghost = 'ghost',
  Default = 'default',
  Dashed = 'dashed',
}

/**
 * @props
 */
interface IProps {
  center?: boolean;
  to?: string;
  disabled?: boolean;
  loading?: boolean;
  style?: any;
  submit?: boolean;
  onClick?: (e: React.FormEvent) => void;
  type?: BtnType;
  className?: string;
  icon?: React.ReactNode;
  children?: string | React.ReactNode;
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
 * Used by antd form event on submit
 */
class Default extends React.PureComponent<IProps, IState> {
  render() {
    const {
      children,
      style,
      center,
      disabled,
      className,
      loading,
      submit,
      icon,
      to,
      type,
      onClick,
    } = this.props;

    return to ? (
      <div
        className={`ant-btn ant-btn-${type ? type.toLowerCase() : 'primary'}${
          center ? ' center' : ''
        }${className ? ` ${className}` : ''}`}
        style={style}
        onClick={onClick}
      >
        <Link to={to}>
          {icon && (
            <Div
              style={{
                marginRight: '15px',
              }}
            >
              {icon}
            </Div>
          )}
          {children}
        </Link>
      </div>
    ) : (
      <Button
        style={style}
        loading={loading}
        disabled={disabled}
        onClick={onClick}
        className={className}
        type={type || BtnType.Default}
        htmlType={submit ? 'submit' : 'button'}
      >
        {icon && (
          <Div
            style={{
              marginRight: '15px',
            }}
          >
            {icon}
          </Div>
        )}
        {children}
      </Button>
    );
  }
}

export default Default;
