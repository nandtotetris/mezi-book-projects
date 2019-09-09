import { Locale } from 'antd/lib/locale-provider';
import moment from 'moment';
import * as React from 'react';
import { addLocaleData } from 'react-intl';
import { getLocale } from 'services/I18N';
import defaultModule from 'services/I18N/locales/fr';

addLocaleData(defaultModule.data);

export interface IAppLocale {
  messages: JSON;
  antd: Locale;
  locale: string;
  data: Locale;
}

interface IProps {
  children: React.ReactNode;
}

export interface InjectedI18NContextProps {
  appLocale: any;
  setLocale(locale: string): void;
}

interface IState extends InjectedI18NContextProps {}

const I18NContext = React.createContext<IState>({
  appLocale: defaultModule,
  setLocale: () => {},
});

class I18NProvider extends React.PureComponent<IProps, IState> {
  state = {
    appLocale: defaultModule,
    messages: [],
    setLocale: async (locale: string) => {
      /**
       * @see https://developers.google.com/web/updates/2017/11/dynamic-import
       */
      const module = await import(`../services/I18N/locales/${locale}`);
      const appLocale = module.default;
      moment.locale(locale);

      addLocaleData(appLocale.data);

      this.setState({
        appLocale,
      });
    },
  };

  async componentDidMount() {
    const locale = getLocale();
    /**
     * @see https://developers.google.com/web/updates/2017/11/dynamic-import
     */
    const module = await import(`../services/I18N/locales/${locale}`);
    await import(`moment/locale/${locale.replace(/_.*/, '')}`);

    const appLocale = {
      ...module.default,
      messages: {
        ...defaultModule.messages,
        ...module.default.messages,
      },
    };

    addLocaleData(appLocale.data);

    this.setState({ appLocale });
  }

  render() {
    return (
      <I18NContext.Provider value={this.state}>
        {this.props.children}
      </I18NContext.Provider>
    );
  }
}

const I18NConsumer = I18NContext.Consumer;

export { I18NProvider, I18NConsumer };
