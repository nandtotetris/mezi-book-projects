import * as React from 'react';

import './Default.module.less';

interface ICss {
  primaryColor?: boolean;
  darkColor?: boolean;
  lightColor?: boolean;
  lighterColor?: boolean;
  thin?: boolean;
  extraLight?: boolean;
  light?: boolean;
  regular?: boolean;
  medium?: boolean;
  semiBold?: boolean;
  bold?: boolean;
  extraBold?: boolean;
  black?: boolean;
  flex?: boolean;
  flexSize?: number;
  uppercase?: boolean;
  spaceOver?: number;
  spaceUnder?: number;
  fontSize?: string;
  pointer?: boolean;
  row?: boolean;
  col?: boolean;
  id?: string;
}

export interface IDefaultProps extends React.HTMLProps<HTMLElement> {
  tag?: string;
  css?: ICss;
}

export interface IDefaultState {}

class IDefault extends React.PureComponent<IDefaultProps, IDefaultState> {
  static defaultProps = {
    css: {},
    tag: 'div',
  };

  state = {};

  getClasses(css?: ICss, className?: string): string {
    return `
    ${css &&
      `${css.primaryColor ? `primaryColor ` : ''}${
        css.darkColor ? `darkColor ` : ''
      }${css.lightColor ? `lightColor ` : ''}${
        css.lighterColor ? `lighterColor ` : ''
      }${css.uppercase ? `uppercase ` : ''}${css.thin ? `thin ` : ''}${
        css.extraLight ? `extraLight ` : ''
      }${css.light ? `light ` : ''}${css.regular ? `regular ` : ''}${
        css.medium ? `medium ` : ''
      }${css.semiBold ? `semiBold ` : ''}${css.bold ? `bold ` : ''}${
        css.extraBold ? `extraBold ` : ''
      }${css.black ? `black ` : ''}${css.uppercase ? `uppercase ` : ''}${
        className ? `${className} ` : ''
      }typo`}`;
  }

  getStyle(style?: React.CSSProperties, css?: ICss): React.CSSProperties {
    const styleOverride: React.CSSProperties = {
      ...(style ? style : {}),
      ...(css && css.flex ? { display: 'flex' } : {}),
      ...(css && css.row ? { flexDirection: 'row' } : {}),
      ...(css && css.col ? { flexDirection: 'column' } : {}),
      ...(css && css.flexSize ? { flex: css && css.flexSize } : {}),
      ...(css && css.spaceOver ? { marginTop: css && css.spaceOver } : {}),
      ...(css && css.spaceUnder ? { marginBottom: css && css.spaceUnder } : {}),
      ...(css && css.fontSize ? { fontSize: css && css.fontSize } : {}),
      ...(css && css.pointer ? { cursor: 'pointer' } : {}),
    };

    return styleOverride;
  }

  createHTMLElement(props: IDefaultProps): React.ReactNode {
    const { tag, children, style, css, className, ...rest } = props;

    const node: React.ReactNode = React.createElement(
      tag || 'div',
      {
        ...rest,
        className: this.getClasses(css, className),
        style: this.getStyle(style, css),
      },
      children,
    );

    return node;
  }

  render() {
    return this.createHTMLElement(this.props);
  }
}

export default IDefault;
