let currencies: any;

const all = async () => {
  if (!currencies) {
    const response = await fetch('/currency.json');
    currencies = await response.json();
  }

  return currencies;
};

const symbol = (currency: string) => {
  let result = '';
  Object.keys(currencies).map((key: string, i: number) => {
    if (currency === currencies[key].code) {
      result = currencies[key].symbol;
    }
  });
  return result;
};

export default {
  all,
  symbol,
};
