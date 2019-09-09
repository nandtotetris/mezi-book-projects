import React from 'react';
// import ReactDOM from 'react-dom';
import App from './App';
import renderer from 'react-test-renderer';
import { MockedProvider } from 'react-apollo/test-utils';
import { IntlProvider } from 'react-intl';

const mocks = [];

it('renders without error', () => {
  renderer.create(
    <MockedProvider mocks={mocks} addTypename={false}>
      <IntlProvider locale="en">
        <App />
      </IntlProvider>
    </MockedProvider>,
  );
});

// it('renders without crashing', () => {
//   const div = document.createElement('div');
//   ReactDOM.render(<App />, div);
//   ReactDOM.unmountComponentAtNode(div);
// });
