import * as React from 'react';
import { wrapDisplayName } from 'recompose';
import { Consumer, IAlertContextInterface } from './context';

const withAlert = () => <OriginalProps extends {}>(
  Component: React.ComponentType<OriginalProps & IAlertContextInterface>,
) => {
  type ResultProps = OriginalProps & IAlertContextInterface;

  class WithAlert extends React.Component<ResultProps> {
    render() {
      return (
        <Consumer>{props => <Component {...this.props} {...props} />}</Consumer>
      );
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    (WithAlert as any).displayName = wrapDisplayName(Component, 'withAlert');
  }

  return WithAlert;
};

export default withAlert;
