import messages from './fr.json';
import antd from 'antd/lib/locale-provider/fr_FR';
import data from 'react-intl/locale-data/fr';

export default {
  messages,
  antd,
  locale: 'fr-FR',
  data
};

// /**
//  * @see https://developers.google.com/web/updates/2017/11/dynamic-import
//  */
// export default async function getLocaleFr() {
//   const messages = await import('./fr.json');
//   const antd = import('antd/lib/locale-provider/fr_FR');
//   const data = import('react-intl/locale-data/fr');

//   return {
//     messages,
//     antd,
//     locale: 'en-US',
//     data
//   };
// }
