import { checkMissingKeys } from './utils/check-missing-key.utils';

const treezorConfig = {
  baseUrl: process.env.TREEZOR_API_URL,
  token: process.env.TREEZOR_TOKEN,
  secretKey: process.env.TREEZOR_SECRET_KEY,
  treezorAccountLibeo: process.env.TREEZOR_ACCOUNT_LIBEO,
};

checkMissingKeys(treezorConfig);

export type TreezorConfig = typeof treezorConfig;

export default treezorConfig;
