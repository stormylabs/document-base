import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { NormalizeQueryParamsValidationPipe } from './shared/NormalizeQueryParamsValidationPipe';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new NormalizeQueryParamsValidationPipe(),
    new ValidationPipe({
      transform: true,
    }),
  );
  app.useBodyParser('urlencoded', {
    extended: false,
  });

  app.use(cookieParser());
  app.enableCors();

  const options = new DocumentBuilder()
    .setTitle('DocumentBase API')
    .setDescription('API documentations of Document Base')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api/v1/docs', app, document);

  await app.listen(3000);
}
bootstrap();
