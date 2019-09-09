import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import IDefault, { IDefaultProps, IDefaultState, IType } from './Default';

/**
 * @class EmailInput
 *
 * Herit from IDefault class, state and props
 *
 * Customized by default props (usually email stuff)
 * Can be overrided by parent set props
 */
class EmailInput extends React.PureComponent<IDefaultProps, IDefaultState> {
  static defaultProps = {
    id: 'username',
    label: <FormattedMessage id="common.input.email" />,
    rules: [
      {
        message: 'Adresse e-mail invalide',
        pattern: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        required: true,
      },
    ],
    type: IType.Email,
    validateTrigger: 'onBlur',
  };

  render() {
    return <IDefault {...this.props} />;
  }
}

export default EmailInput;
