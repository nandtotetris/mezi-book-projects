import { FormComponentProps } from 'antd/lib/form';
import { Option, Select } from 'components/Form';
import * as React from 'react';
import { compose } from 'react-apollo';
import { FormattedMessage, InjectedIntlProps, injectIntl } from 'react-intl';
import { IType } from './Default';

interface IProps extends FormComponentProps, InjectedIntlProps {
  defaultValue?: string;
  title?: string;
  error?: string;
  id?: string;
  iso?: string;
}
interface IState {
  countries?: any;
  data?: any;
  filteredData?: any;
}

/**
 * @class CountryInput
 *
 * Herit from IDefault class, state and props
 *
 * Customized by default props
 * No default validation rules
 */
class CountryInput extends React.PureComponent<IProps, IState> {
  static defaultProps = {
    id: 'select',
    label: 'select',
    rules: [],
    type: IType.Select,
  };

  state = {
    countries: undefined,
    data: {},
    filteredData: undefined,
  };

  handleSearch: (value: string) => void;
  constructor(props: any) {
    super(props);

    this.handleSearch = this.search.bind(this);
  }

  async componentDidMount() {
    const response = await fetch('/country.json');
    const countries: any = await response.json();
    this.setState({
      countries,
      data: countries,
    });
  }

  search(value: string) {
    const data: any = this.state.data;
    let filteredData: any = {};
    if (value && value !== '') {
      data &&
        Object.keys(data).map((key: string, i: number) => {
          const country: any = data[key];
          if (country.native.toLowerCase().indexOf(value.toLowerCase()) === 0) {
            filteredData[key] = country;
          }
        });
    } else {
      filteredData = data;
    }

    this.setState({ filteredData });
  }

  render() {
    const { defaultValue, form, intl, title, error, id, iso } = this.props;
    const data: any = this.state.filteredData || this.state.data;

    return (
      <Select
        defaultValue={defaultValue}
        showSearch
        onSearch={this.handleSearch}
        form={form}
        filterOption={false}
        label={title && <FormattedMessage id={title} />}
        id={id || 'country'}
        rules={[
          {
            message: intl.formatMessage({
              id: error || '',
            }),
            required: true,
          },
        ]}
        options={
          data !== undefined &&
          Object.keys(data).map((key: any, i: number) => {
            const country: any = data[key];
            return (
              <Option
                value={`${iso ? key : country.native}`}
                key={`${iso ? key : country.native}`}
              >
                {country.native}
              </Option>
            );
          })
        }
      />
    );
  }
}

export default compose(injectIntl)(CountryInput);
