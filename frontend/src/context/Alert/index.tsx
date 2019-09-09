import { Consumer, IAlertContextInterface } from './context';
import hoc from './hoc';
import Provider from './provider';

export interface InjectedProps extends IAlertContextInterface {}

export { Provider, Consumer, hoc };
