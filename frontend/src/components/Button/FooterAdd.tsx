import { Icon } from 'components/Assets';
import { IconValue } from 'components/Assets/Icon';
import { Div } from 'components/Typo';
import * as React from 'react';

/**
 * @props
 */
interface IProps {
  children: React.ReactNode | null;
  onClick?: () => void;
}

/**
 * @state
 */
interface IState {}

class FooterAdd extends React.PureComponent<IProps, IState> {
  render() {
    const { children, onClick } = this.props;

    return (
      <Div
        css={{
          flex: true,
          medium: true,
          pointer: true,
          primaryColor: true,
          spaceOver: 17,
        }}
        style={{
          alignItems: 'center',
          height: '17px',
        }}
        onClick={onClick}
      >
        <Icon
          value={IconValue.Plus}
          style={{
            marginRight: '10px',
          }}
        />
        <u>{children}</u>
      </Div>
    );
  }
}

export default FooterAdd;
