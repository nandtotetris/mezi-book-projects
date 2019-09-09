import IDefault from './Default';

class Div extends IDefault {
  static defaultProps = {
    ...IDefault.defaultProps,
    className: 'Div',
    tag: 'div',
  };
}

export default Div;
