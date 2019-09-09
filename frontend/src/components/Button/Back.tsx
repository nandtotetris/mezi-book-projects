import { Div } from 'components/Typo';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { Icon } from 'components/Assets';
import { IconValue } from 'components/Assets/Icon';

/**
 * @props
 */
interface IProps extends RouteComponentProps {}

/**
 * @state
 */
interface IState {}

class Default extends React.PureComponent<IProps, IState> {
  handleClick: () => void;

  constructor(props: any) {
    super(props);

    this.handleClick = this.click.bind(this);
  }

  click() {
    const { history } = this.props;

    history.goBack();
  }

  render() {
    const { children } = this.props;

    return (
      <Div
        css={{
          flex: true,
          lightColor: true,
          medium: true,
          pointer: true,
          spaceUnder: 18,
        }}
        onClick={this.handleClick}
      >
        <Div
          style={{
            alignItems: 'center',
            fontSize: '15px',
            height: '20px',
            marginRight: '9px',
            width: '20px',
          }}
        >
          <Icon value={IconValue.ArrowThinLeft} />
        </Div>
        {children}
      </Div>
    );
  }
}

export default withRouter(Default);
