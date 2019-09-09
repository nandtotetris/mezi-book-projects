import { Icon } from 'antd';
import * as React from 'react';

/**
 * @props
 */
interface IProps {}
interface IState {}

class Loading extends React.PureComponent<IProps, IState> {
  render() {
    return (
      <Icon className="loading" type="loading" style={{ fontSize: 24 }} spin />
    );
  }
}

export default Loading;
