import { Col, Layout, Row } from 'antd';
import * as AlertCtx from 'context/Alert';
import * as React from 'react';
import { isMobile } from 'react-device-detect';
import GuestNavBar from './GuestNavBar';
import './Header.module.less';

import { Icon } from 'components/Assets';

import { Alert } from 'components/Alert';
import { IconValue } from 'components/Assets/Icon';
import { Div } from 'components/Typo';
import { compose } from 'react-apollo';
import { FormattedMessage } from 'react-intl';
import { NavLink } from 'react-router-dom';

const { Header } = Layout;

interface IProps extends AlertCtx.InjectedProps {
  authenticated: boolean;
}

const AppHeader: React.FunctionComponent<IProps> = ({
  authenticated,
  alert,
}) => {
  return (
    <Header className="Header">
      <Row
        style={{ height: '100%' }}
        type="flex"
        justify="space-between"
        align="middle"
      >
        <Col xs={24} sm={4}>
          <NavLink to="/">
            <Div
              className="logo"
              css={{
                flex: true,
                row: true,
              }}
              style={{
                justifyContent: 'center',
                width: '100px',
              }}
            >
              <Icon value={IconValue.Logo} />
              <span className="logo-beta">Beta</span>
            </Div>
          </NavLink>
        </Col>
        {!isMobile && <Col sm={20}>{!authenticated && <GuestNavBar />}</Col>}
      </Row>
      {authenticated &&
        alert &&
        alert.errors &&
        alert.errors.map((error, i) => (
          <Alert
            floating
            key={`${i}`}
            alertItem={error}
            closable
            background
            message={error.message && <FormattedMessage id={error.message} />}
            type="error"
          />
        ))}
      {authenticated &&
        alert &&
        alert.warnings &&
        alert.warnings.map((warning, i) => (
          <Alert
            floating
            key={`${i}`}
            alertItem={warning}
            closable
            background
            message={
              warning.message && <FormattedMessage id={warning.message} />
            }
            type="warning"
          />
        ))}
      {authenticated &&
        alert &&
        alert.successes &&
        alert.successes.map((success, i) => (
          <Alert
            floating
            key={`${i}`}
            alertItem={success}
            closable
            background
            message={
              success.message && <FormattedMessage id={success.message} />
            }
            type="success"
          />
        ))}
    </Header>
  );
};

export default compose(AlertCtx.hoc())(AppHeader);
