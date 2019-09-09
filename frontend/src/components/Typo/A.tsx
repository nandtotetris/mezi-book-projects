import IDefault from './Default';

import './A.module.less';

class A extends IDefault {
  static defaultProps = {
    ...IDefault.defaultProps,
    className: 'A',
    tag: 'a',
  };
}

export default A;
