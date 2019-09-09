import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as express from 'express';
import * as Sentry from '@sentry/node';

async function bootstrap() {
  const server = express();
  const expressAdapter = new ExpressAdapter(server);
  expressAdapter.useStaticAssets('public', {setHeaders: (res) => {res.set('Access-Control-Allow-Origin', '*'); }});
  const app = await NestFactory.create(AppModule, expressAdapter);
  const sentryConfig = app.get('ConfigService').get('sentry');
  Sentry.init({ dsn: sentryConfig.SENTRY_DSN, release: sentryConfig.RELEASE, environment: sentryConfig.ENVIRONMENT });
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  const port = process.env.PORT || 9000;
  if (port && (typeof port === 'string') && fs.existsSync(port) && fs.lstatSync(port).isSocket()) {
    fs.unlinkSync(port);
  }

  await app.listen(port);
}

bootstrap();
