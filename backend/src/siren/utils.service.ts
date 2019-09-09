export enum SearchCompaniesType {
  SIRET = 'siret',
  SIREN = 'siren',
  QUERY = 'raisonSociale',
}

export const getPrefixTypeSearchCompanies = (str: string): SearchCompaniesType|null => {
  const regex: any = /(^[\d+]{1,9}$)|(^[\d+]{9,14}$)|(^[a-z\d\-_\s]+$)/i;
  let prefix: SearchCompaniesType|null = null;
  const m: string[] = regex.exec(str);

  if (m !== null) {
    m.forEach((match, groupIndex) => {
      if (match && groupIndex === 1) {
        prefix = SearchCompaniesType.SIREN;
      } else if (match && groupIndex === 2) {
        prefix = SearchCompaniesType.SIRET;
      } else if (match && groupIndex === 3) {
        prefix = SearchCompaniesType.QUERY;
      }
    });
  }

  return prefix;
};
