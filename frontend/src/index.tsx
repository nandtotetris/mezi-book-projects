import { LocaleProvider } from 'antd';
import { ErrorBoundary } from 'components/Error';
import { I18NConsumer, I18NProvider } from 'context/I18NContext';
import * as React from 'react';
import ReactDOM from 'react-dom';
import { IntlProvider } from 'react-intl';
import { initErrorTracker } from 'services/error';
import App from './App';
import * as serviceWorker from './serviceWorker';
import configureClient from './store';

initErrorTracker();

async function render(Component: React.ComponentClass) {
  const client = await configureClient();

  ReactDOM.render(
    <I18NProvider>
      <I18NConsumer>
        {({ appLocale }) => {
          return (
            <LocaleProvider locale={appLocale.antd}>
              <IntlProvider
                locale={appLocale.locale}
                messages={appLocale.messages}
                defaultLocale={appLocale.locale}
              >
                <ErrorBoundary>
                  <Component />
                </ErrorBoundary>
              </IntlProvider>
            </LocaleProvider>
          );
        }}
      </I18NConsumer>
    </I18NProvider>,
    document.getElementById('root'),
  );
}

render(App);

if (module.hot) {
  module.hot.accept('./App', () => {
    const NextApp = require('./App').default;
    render(NextApp);
  });
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
