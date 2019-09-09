import { Icon } from 'components/Assets';
import { IconValue } from 'components/Assets/Icon';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';

interface IProps {
  children?: React.ReactNode;
}

interface IState {
  randomImg: number;
  randomText: number;
}

class Empty extends React.PureComponent<IProps, IState> {
  static defaultProps = {};

  state = {
    randomImg: Math.round(Math.random() * 2),
    randomText: Math.round(Math.random() * 3),
  };

  render() {
    const { children } = this.props;
    const { randomText, randomImg } = this.state;

    let icon: IconValue;
    switch (randomImg) {
      case 1:
        icon = IconValue.NoData1;
        break;
      case 2:
        icon = IconValue.NoData2;
        break;
      default:
        icon = IconValue.NoData0;
        break;
    }

    return (
      <div className="empty-table">
        <div className="svg-responsive">
          <Icon value={icon} />
        </div>
        <FormattedMessage id={`purchase.table.no_data_${randomText}`} />
        {children}
      </div>
    );
  }
}

export default Empty;
