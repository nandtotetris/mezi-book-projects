import { Form } from 'antd';
import { BtnType, Button } from 'components/Button';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';

const FormItem = Form.Item;

/**
 * @props
 */
interface IProps {
  className?: string;
  label: FormattedMessage.Props;
}

/**
 * @state
 *
 * error
 */
interface IState {}

/**
 * @class Submit
 *
 * Used by antd form event on submit
 */
class Submit extends React.PureComponent<IProps, IState> {
  render() {
    const { className, label } = this.props;

    return (
      <FormItem
        className={`form-item form-item-submit${
          className ? ` ${className}` : ''
        }`}
      >
        <Button type={BtnType.Primary} submit>
          {<FormattedMessage {...label} />}
        </Button>
      </FormItem>
    );
  }
}

export default Submit;
