import * as React from 'react';
import IDefault, { IDefaultProps, IDefaultState, IType } from './Default';

/**
 * @class RadioInput
 *
 * Herit from IDefault class, state and props
 *
 * Customized by default props
 * No default validation rules
 */
class RadioInput extends React.PureComponent<IDefaultProps, IDefaultState> {
  static defaultProps = {
    id: 'radio',
    label: 'radio',
    rules: [],
    type: IType.Radios,
  };

  render() {
    return <IDefault {...this.props} />;
  }
}

export default RadioInput;
