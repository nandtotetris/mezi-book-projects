import * as React from 'react';
import IDefault, { IDefaultProps, IDefaultState, IType } from './Default';

/**
 * @class SliderInput
 *
 * Herit from IDefault class, state and props
 *
 * Customized by default props
 * No default validation rules
 */
class SliderInput extends React.PureComponent<IDefaultProps, IDefaultState> {
  static defaultProps = {
    id: 'slider',
    label: 'slider',
    rules: [],
    type: IType.Slider,
  };

  render() {
    return <IDefault {...this.props} />;
  }
}

export default SliderInput;
