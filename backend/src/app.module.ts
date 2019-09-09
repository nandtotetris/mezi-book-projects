import * as contextService from 'request-context';
import { resolve } from 'path';
import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from 'nestjs-config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { RavenModule, RavenInterceptor } from 'nest-raven';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { SnakeNamingStrategy, CamelNamingStrategy } from './naming-strategy';
import { NotificationModule } from './notification/notification.module';

const getConnectionOptions = () => {
  if (process.env.NODE_ENV === 'test') {
    return {
      type: 'sqljs',
      dropSchema: true,
      location: resolve(__dirname, '../e2e', 'libeo.db'),
      namingStrategy: new CamelNamingStrategy(),
    };
  }
  return {
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    namingStrategy: new SnakeNamingStrategy(),
  };
};

@Module({
  imports: [
    ConfigModule.load(resolve(__dirname, 'config', '**', '!(*.d).{ts,js}')),
    RavenModule,
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => {
        const connectionOptions = getConnectionOptions();
        const defaultConnectionOptions = {
          logging: (process.env.TYPEORM_LOGGING === 'true'),
          entities: [resolve(__dirname, '**/*.entity{.ts,.js}')],
          subscribers: [resolve(__dirname, '**/*.subscriber{.ts,.js}')],
          synchronize: (process.env.TYPEORM_SYNCHRONIZE === 'true'),
        };

        return Object.assign(defaultConnectionOptions, connectionOptions);
      },
      inject: [ConfigService],
    }),
    GraphQLModule.forRootAsync({
      useFactory: (config: ConfigService) => config.get('graphql'),
      inject: [ConfigService],
    }),
    CommonModule,
    NotificationModule,
    AuthModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useValue: new RavenInterceptor(),
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(contextService.middleware('request'))
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
