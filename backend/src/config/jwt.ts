interface JWTConfig {
  secretOrPrivateKey: string;
  signOptions: object;
}

const jwtConfig: JWTConfig = {
  secretOrPrivateKey: process.env.JWT_SECRET,
  signOptions: {
    expiresIn: parseInt(process.env.JWT_EXPIRESIN, 10),
  },
};

export default jwtConfig;
