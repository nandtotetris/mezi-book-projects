import IDefault from './Default';

import './H3.module.less';

class H3 extends IDefault {
  static defaultProps = {
    ...IDefault.defaultProps,
    className: 'H3',
    tag: 'h3',
  };
}

export default H3;
