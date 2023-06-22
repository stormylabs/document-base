import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { ValidationPipe } from './shared/ValidationPipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());

  app.setGlobalPrefix('api/v1');

  const config = app.get(ConfigService);

  const NODE_ENV = config.get<string>('NODE_ENV');

  if (NODE_ENV !== 'production') {
    const options = new DocumentBuilder()
      .setTitle('DocumentBase API')
      .setDescription('API documentations of Document Base')
      .setVersion('1.0.0')
      .addBasicAuth()
      .build();

    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api/v1/docs', app, document);
  }

  await app.listen(3000);
}
bootstrap();
