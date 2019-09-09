import { resolve } from 'path';
import { ConnectionOptions } from 'typeorm';
import { SnakeNamingStrategy } from '../naming-strategy';

const typeOrmConfig: ConnectionOptions = {
  name: 'default',
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT, 10),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  logging: true,
  entities: [resolve(__dirname, '**/*.entity{.ts,.js}')],
  subscribers: [resolve(__dirname, '**/*.subscriber{.ts,.js}')],
  namingStrategy: new SnakeNamingStrategy(),
  synchronize: true,
};

export default typeOrmConfig;
