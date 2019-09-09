import IDefault from './Default';

import './H1.module.less';

class H1 extends IDefault {
  static defaultProps = {
    ...IDefault.defaultProps,
    className: 'H1',
    tag: 'h1',
  };
}

export default H1;
