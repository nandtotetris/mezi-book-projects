import { Icon } from 'components/Assets';
import { IconValue } from 'components/Assets/Icon';
import * as React from 'react';
import IDefault, { IDefaultProps, IDefaultState, IType } from './Default';

interface IState extends IDefaultState {
  passwordVisible: boolean;
}

/**
 * @class PasswordInput
 *
 * Herit from IDefault class, state and props
 *
 * Customized by default props (usually required)
 * Can be overrided by parent set props
 *
 * @Todo missing default rules (lenght, specials char, etc)
 */
class PasswordInput extends React.PureComponent<IDefaultProps, IState> {
  static defaultProps = {
    id: 'password',
    label: 'Mot de passe',
    rules: [
      {
        message: 'Veuillez renseigner votre mot de passe',
        required: true,
      },
    ],
    type: IType.Password,
  };

  state = {
    active: false,
    autofill: false,
    passwordVisible: false,
  };

  handleShowPassword: () => void;

  constructor(props: any) {
    super(props);

    this.handleShowPassword = this.showPassword.bind(this);
  }

  showPassword() {
    this.setState({ passwordVisible: !this.state.passwordVisible });
  }

  render() {
    const { passwordVisible } = this.state;

    return (
      <>
        <IDefault
          {...{
            ...this.props,
            type: !passwordVisible ? IType.Password : IType.Text,
          }}
          suffix={
            <Icon
              style={{
                cursor: 'pointer',
              }}
              value={IconValue.EyeOpen}
              color={!passwordVisible ? '#AEAEAE' : '#0053FA'}
              onClick={this.handleShowPassword}
            />
          }
        />
      </>
    );
  }
}

export default PasswordInput;
