import { PublicRoute } from 'components/Route';
import * as React from 'react';
import { isMobile } from 'react-device-detect';
import { Switch } from 'react-router-dom';

const NotFound = React.lazy(() => import('screens/NotFound'));

const AppRouter = () =>
  isMobile ? (
    <Switch>
      <PublicRoute component={NotFound} />
    </Switch>
  ) : (
    <Switch>
      <PublicRoute component={NotFound} />
    </Switch>
  );

export default AppRouter;
