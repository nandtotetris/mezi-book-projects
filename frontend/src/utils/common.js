import moment from 'moment';

export const toServerDate = (date) => {
  if(!date) return date;
  date = moment(date).utc().millisecond(0).second(0).minute(0).hours(0);
  return moment(date);
}

export const toPickerDate = (date) => {
  return moment(date);
}

export const toDisplayDate = (date) => {
  return moment(date).format('DD/MM/YYYY');
}

export const escapeRegExp = (text) => {
  return text ? text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') : '';
}

export const staticAssets = (filepath) => {
  return /^http|^\/\//.test(filepath) ?
  filepath :
  `${(window.__LIBEO__ ? window.__LIBEO__.api : window.location.origin)}/static/${filepath}`;
};


export const isIban = (iban) => {
  return /^([A-Z]{2}[ -]?[0-9]{2})(?=(?:[ -]?[A-Z0-9]){9,30}$)((?:[ -]?[A-Z0-9]{3,5}){2,7})([ -]?[A-Z0-9]{1,3})?$/gm.test(iban);
};
