import IDefault from './Default';

import './P.module.less';

class P extends IDefault {
  static defaultProps = {
    ...IDefault.defaultProps,
    className: 'P',
    tag: 'p',
  };
}

export default P;
