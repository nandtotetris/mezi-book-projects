import * as Sentry from '@sentry/browser';
import { Layout, Modal } from 'antd';
import { ModalFuncProps } from 'antd/lib/modal';
import * as React from 'react';

interface IProps {
  children: React.ReactNode;
}
interface IState {
  hasError: boolean;
}

class ErrorBoundary extends React.PureComponent<IProps, IState> {
  static getDerivedStateFromError() {
    return { hasError: true };
  }

  readonly state = {
    hasError: false,
  };

  private modal?: {
    destroy: () => void;
    update: (newConfig: ModalFuncProps) => void;
  };

  componentDidCatch(error: Error, errorInfo: any) {
    Sentry.withScope(scope => {
      Object.keys(errorInfo).forEach(key => {
        scope.setExtra(key, errorInfo[key]);
      });
      Sentry.captureException(error);
    });

    this.modal = Modal.error({
      content: (
        <div>
          <p>Notre équipe technique vient d'en être informée</p>
          <p>
            Please{' '}
            <a
              href="mailto:info@adfab.com"
              onClick={this.reportErrors}
              className="text-link"
            >
              let us know
            </a>{' '}
            what happened
          </p>
        </div>
      ),
      title: 'Oups ... une erreur est survenue',
    });
  }

  reportErrors = (e: React.MouseEvent): void => {
    this.modal && this.modal.destroy();

    if (Sentry.lastEventId()) {
      e.preventDefault();
      Sentry.showReportDialog();
    }
  };

  render() {
    const { hasError } = this.state;

    if (hasError) {
      return (
        <Layout style={{ minHeight: '100vh' }}>
          <Layout style={{ flex: 1, padding: 50 }}>
            <Layout.Content
              style={{
                alignItems: 'center',
                background: '#fff',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <p>Veuillez rafraichir la page.</p>
            </Layout.Content>
          </Layout>
        </Layout>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
