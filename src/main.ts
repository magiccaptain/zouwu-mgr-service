import fs from 'fs';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import minMax from 'dayjs/plugin/minMax';

// import { ByWhoInterceptor } from 'src/auth';
import { settings } from 'src/config';
import { MongoErrorsInterceptor } from 'src/mongo';

import { AppModule } from './app.module';

dayjs.extend(isoWeek);
dayjs.extend(minMax);

const openapiPath = `openapi.json`;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: { exposedHeaders: ['Link', 'X-Total-Count'] },
  });
  app.setGlobalPrefix(settings.prefix);

  const config = new DocumentBuilder()
    .setTitle('ZouWu API Server')
    .setDescription('ZouWu API for swap-charge services')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('health')
    .addTag('auth')
    .addTag('pal')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${settings.prefix}/openapi`, app, document);

  app.use(compression());
  app.useGlobalPipes(new ValidationPipe({ whitelist: false, transform: true }));
  app.useGlobalInterceptors(new MongoErrorsInterceptor());
  // app.useGlobalInterceptors(new ByWhoInterceptor());
  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.MQTT,
      options: settings.mqtt,
    },
    { inheritAppConfig: true }
  );

  await app.startAllMicroservices();
  await app.listen(settings.port);

  // write openapi.json
  if (process.env.NODE_ENV === 'development') {
    fs.writeFileSync(openapiPath, JSON.stringify(document, null, 2));
  }

  console.log('NODE_ENV=', process.env.NODE_ENV);
}

bootstrap();
