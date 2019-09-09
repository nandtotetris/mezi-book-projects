import * as React from 'react';
import IDefault, { IDefaultProps, IDefaultState, IType } from './Default';

/**
 * @class HiddenInput
 *
 * Herit from IDefault class, state and props
 *
 * Customized by default props
 * No default validation rules
 */
class HiddenInput extends React.PureComponent<IDefaultProps, IDefaultState> {
  static defaultProps = {
    id: 'hidden',
    label: 'hidden',
    rules: [],
    type: IType.Hidden,
  };

  render() {
    return <IDefault {...this.props} />;
  }
}

export default HiddenInput;
