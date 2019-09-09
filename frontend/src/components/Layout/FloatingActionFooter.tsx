import * as React from 'react';

interface IProps {
  children: React.ReactNode;
  visible: boolean;
  style?: any;
}

interface IState {}

class Viewer extends React.PureComponent<IProps, IState> {
  state = {};

  render() {
    const { children, style, visible } = this.props;

    return (
      visible && (
        <div style={style} className="floating-action-footer">
          {children}
        </div>
      )
    );
  }
}

export default Viewer;
