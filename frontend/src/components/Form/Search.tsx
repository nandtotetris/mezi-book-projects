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
class SearchInput extends React.PureComponent<IDefaultProps, IDefaultState> {
  static defaultProps = {
    id: 'search',
    label: 'search',
    rules: [],
    type: IType.Search,
  };

  render() {
    return <IDefault {...this.props} />;
  }
}

export default SearchInput;
