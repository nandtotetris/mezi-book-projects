import IDefault from './Default';

import './H2.module.less';

class H2 extends IDefault {
  static defaultProps = {
    ...IDefault.defaultProps,
    className: 'H2',
    tag: 'h2',
  };
}

export default H2;
