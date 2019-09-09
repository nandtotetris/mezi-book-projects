import * as React from 'react';
import { IAlert } from './types';

export interface IAlertInterface {
  dismiss: (alert: IAlert) => void;
  error: (msg: string, autoDissmiss: boolean) => void;
  errors: IAlert[];
  reset: () => void;
  success: (msg: string, autoDissmiss: boolean) => void;
  successes: IAlert[];
  warning: (msg: string, autoDissmiss: boolean) => void;
  warnings: IAlert[];
}

export interface IAlertContextInterface {
  alert?: IAlertInterface;
}

const { Provider, Consumer } = React.createContext<IAlertContextInterface>({
  alert: {
    dismiss: (alert: IAlert) => {},
    error: () => {},
    errors: [],
    reset: () => {},
    success: () => {},
    successes: [],
    warning: () => {},
    warnings: [],
  },
});

export { Provider, Consumer };
