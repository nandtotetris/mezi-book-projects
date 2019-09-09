import { version } from '../../../package.json';
import * as Sentry from '@sentry/browser';

export function initErrorTracker() {
  if(window.__LIBEO__.REACT_APP_SENTRY_DSN) {
    Sentry.init({
      dsn: window.__LIBEO__.REACT_APP_SENTRY_DSN,
      release: version,
      environment: window.__LIBEO__.ENV
    });
  }
}
