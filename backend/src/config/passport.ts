interface PassportConfig {
  defaultStrategy: string;
}

const passportConfig: PassportConfig = {
  defaultStrategy: 'jwt',
};

export default passportConfig;
