export const checkMissingKeys = (config: object) => {
  Object.keys(config).forEach(key => {
    if (typeof config[key] === 'undefined') {
      // throw new Error(`Missing key ${key} in process.env`);
    }
  });
};
