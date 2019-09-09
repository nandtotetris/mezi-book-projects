export function getLocale(): string {
  const lang = navigator.language;

  // return only two first characters
  return lang.substr(0, 2);
}

export interface ILocale {
  label: string;
  value: string;
}

export const locales: ILocale[] = [
  { label: '🇩🇪', value: 'de' },
  { label: '🇺🇸', value: 'en' },
  { label: '🇫🇷', value: 'fr' },
  { label: '🇮🇹', value: 'it' },
];
