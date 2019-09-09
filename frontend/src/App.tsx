import * as Alert from 'context/Alert';
import * as React from 'react';
import { Router } from 'react-router-dom';
import history from 'store/history';
import AppRouter from './AppRouter';
import './styles/index.less';

interface IProps {}
interface IState {}

class App extends React.Component<IProps, IState> {
  render() {
    return (
      <Router history={history}>
        <Alert.Provider>
          <AppRouter />
        </Alert.Provider>
      </Router>
    );
  }
}

export default App;
