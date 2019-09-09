import { Select } from 'antd';
import * as React from 'react';
import IDefault, { IDefaultProps, IDefaultState, IType } from './Default';

export const SelectOption = Select.Option;
export const SelectOptGroup = Select.OptGroup;

/**
 * @class SelectInput
 *
 * Herit from IDefault class, state and props
 *
 * Customized by default props
 * No default validation rules
 */
class SelectInput extends React.PureComponent<IDefaultProps, IDefaultState> {
  static defaultProps = {
    id: 'select',
    label: 'select',
    rules: [],
    type: IType.Select,
  };

  render() {
    return <IDefault {...this.props} />;
  }
}

export default SelectInput;
