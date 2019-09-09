import * as React from 'react';
import IDefault, { IDefaultProps, IDefaultState, IType } from './Default';

/**
 * @class TextInput
 *
 * Herit from IDefault class, state and props
 *
 * Customized by default props
 * No default validation rules
 */
class TextInput extends React.PureComponent<IDefaultProps, IDefaultState> {
  static defaultProps = {
    id: 'text',
    label: '',
    rules: [],
    type: IType.Text,
  };

  render() {
    return <IDefault {...this.props} />;
  }
}

export default TextInput;
