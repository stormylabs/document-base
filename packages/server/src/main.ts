import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { config as awsConfig } from 'aws-sdk';

import { AppModule } from './app.module';
import { NormalizeQueryParamsValidationPipe } from './shared/NormalizeQueryParamsValidationPipe';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new NormalizeQueryParamsValidationPipe(),
    new ValidationPipe({
      transform: true,
    }),
  );

  app.use(cookieParser());
  app.enableCors();
  const config = app.get(ConfigService);

  awsConfig.update({
    accessKeyId: config.get('AWS_ACCESS_KEY_ID'),
    secretAccessKey: config.get('AWS_SECRET_ACCESS_KEY'),
    region: config.get('AWS_REGION'),
  });

  const NODE_ENV = config.get<string>('NODE_ENV');

  if (NODE_ENV !== 'production') {
    const options = new DocumentBuilder()
      .setTitle('DocumentBase API')
      .setDescription('API documentations of Document Base')
      .setVersion('1.0')
      .build();

    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api/v1/docs', app, document);
  }

  await app.listen(3000);
}
bootstrap();
