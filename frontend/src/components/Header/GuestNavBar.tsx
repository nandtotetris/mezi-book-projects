import { Row } from 'antd';
import * as React from 'react';
import { compose } from 'react-apollo';
import { FormattedMessage } from 'react-intl';
import { RouteComponentProps, withRouter } from 'react-router';
import { Link } from 'react-router-dom';

interface IProps extends RouteComponentProps {}

const GuestNavBar: React.FunctionComponent<IProps> = ({ location }) => (
  <Row type="flex" justify="end" align="middle" className="Login__Actions">
    {location.pathname.indexOf('login') > -1 && (
      <div className="ant-btn ant-btn-primary">
        <Link to="/signup">
          <FormattedMessage id="header.nav.signup" />
        </Link>
      </div>
    )}
    {location.pathname.indexOf('signup') > -1 && (
      <div className="ant-btn ant-btn-primary">
        <Link to="/login">
          <FormattedMessage id="header.nav.signin" />
        </Link>
      </div>
    )}
  </Row>
);

export default compose(withRouter)(GuestNavBar);
