import { checkMissingKeys } from './utils/check-missing-key.utils';

const awsConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  bucket: process.env.AWS_BUCKET,
};

checkMissingKeys(awsConfig);

export default awsConfig;