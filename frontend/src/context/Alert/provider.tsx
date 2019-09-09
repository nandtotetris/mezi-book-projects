import { ApolloClient } from 'apollo-client';
import * as React from 'react';
import { compose } from 'react-apollo';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { RouteComponentProps, withRouter } from 'react-router';
import uuidv1 from 'uuid/v1';
import { IAlertContextInterface, Provider } from './context';
import { IAlert, IAlertType } from './types';

interface IState extends IAlertContextInterface {}

interface IProps extends InjectedIntlProps, RouteComponentProps {
  children: React.ReactNode;
  client: ApolloClient<any>;
}

class AlertProvider extends React.PureComponent<IProps, IState> {
  state = {
    alert: {
      dismiss: (dismissed: IAlert) => {
        const { alert } = this.state;

        if (dismissed.type === IAlertType.Error) {
          const errors = alert.errors;
          const newErrors: IAlert[] = [];
          errors &&
            errors.map((error: IAlert) => {
              if (error.id !== dismissed.id) {
                newErrors.push(error);
              }
            });
          this.setState({
            alert: {
              ...alert,
              errors: newErrors,
            },
          });
        } else if (dismissed.type === IAlertType.Success) {
          const successes = alert.successes;
          const newSuccesses: IAlert[] = [];
          successes &&
            successes.map((success: IAlert) => {
              if (success.id !== dismissed.id) {
                newSuccesses.push(success);
              }
            });
          this.setState({
            alert: {
              ...alert,
              successes: newSuccesses,
            },
          });
        }
      },
      error: (msg: string, autoDismiss: boolean = true) => {
        const { alert } = this.state;
        const newError: IAlert = {
          dismiss: autoDismiss,
          id: uuidv1(),
          message: msg,
          type: IAlertType.Error,
        };
        this.setState({
          alert: {
            ...alert,
            errors: [...alert.errors, newError],
          },
        });
      },
      errors: [],
      reset: () => {
        const { alert } = this.state;
        this.setState({
          alert: {
            ...alert,
            errors: [],
            successes: [],
          },
        });
      },
      success: (msg: string, autoDismiss: boolean = true) => {
        const { alert } = this.state;
        const newSuccess: IAlert = {
          dismiss: autoDismiss,
          id: uuidv1(),
          message: msg,
          type: IAlertType.Success,
        };
        this.setState({
          alert: {
            ...alert,
            successes: [...alert.successes, newSuccess],
          },
        });
      },
      successes: [],
      warning: (msg: string, autoDismiss: boolean = true) => {
        const { alert } = this.state;
        const newWarning: IAlert = {
          dismiss: autoDismiss,
          id: uuidv1(),
          message: msg,
          type: IAlertType.Warning,
        };
        this.setState({
          alert: {
            ...alert,
            warnings: [...alert.warnings, newWarning],
          },
        });
      },
      warnings: [],
    },
  };

  render() {
    const { alert } = this.state;

    return <Provider value={{ alert }}>{this.props.children}</Provider>;
  }
}

export default compose(
  withRouter,
  injectIntl,
)(AlertProvider);
