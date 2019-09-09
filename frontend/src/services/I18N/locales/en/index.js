import messages from './en.json';
import antd from 'antd/lib/locale-provider/en_US';
import data from 'react-intl/locale-data/en';

export default {
  messages,
  antd,
  locale: 'en-US',
  data
};

// /**
//  * @see https://developers.google.com/web/updates/2017/11/dynamic-import
//  */
// export default async function getLocaleEn() {
//   const messages = await import('./en.json');
//   const antd = import('antd/lib/locale-provider/en_US');
//   const data = import('react-intl/locale-data/en');

//   return {
//     messages,
//     antd,
//     locale: 'en-US',
//     data
//   };
// }
