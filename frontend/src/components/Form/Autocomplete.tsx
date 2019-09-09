import { AutoComplete } from 'antd';
import { AutoCompleteProps } from 'antd/lib/auto-complete';
import * as React from 'react';

export const Option = AutoComplete.Option;
export const OptGroup = AutoComplete.OptGroup;

interface IProps extends AutoCompleteProps {
  className: string;
}

/**
 * @class AutocompleteInput
 *
 * Herit from IDefault class, state and props
 *
 * Customized by default props
 * No default validation rules
 */
class AutocompleteInput extends React.PureComponent<IProps> {
  static defaultProps = {
    className: 'search-autocomplete',
    id: 'autocomplete',
  };

  render() {
    const { children, ...props } = this.props;

    return (
      <AutoComplete {...props} filterOption={false}>
        {children}
      </AutoComplete>
    );
  }
}

export default AutocompleteInput;
