import IDefault from './Default';

class Span extends IDefault {
  static defaultProps = {
    ...IDefault.defaultProps,
    className: 'Span',
    tag: 'span',
  };
}

export default Span;
