import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

import { AppModule } from '@/app.module';
import { NormalizeQueryParamsValidationPipe } from '@/shared/NormalizeQueryParamsValidationPipe';
import { AuthModule } from '@/module/auth/auth.module';
import { BotModule } from '@/module/bot/bot.module';
import { OrganizationModule } from '@/module/organization/organization.module';
import { UsageModule } from './module/usage/usage.module';

const AVAILABLE_MODULES = {
  bot: BotModule,
  auth: AuthModule,
  org: OrganizationModule,
  usage: UsageModule,
  app: AppModule,
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new NormalizeQueryParamsValidationPipe(),
    new ValidationPipe({
      transform: true,
    })
  );

  app.use(cookieParser());
  app.enableCors();
  const config = app.get(ConfigService);

  const NODE_ENV = config.get<string>('NODE_ENV');

  const whitelistAPIDocs = config.get<string>('WHITELIST_API_DOCS').split(',');

  if (NODE_ENV !== 'production') {
    const options = new DocumentBuilder()
      .setTitle('DocumentBase API')
      .setDescription('API documentations of Document Base')
      .setVersion('1.1.0-beta')
      .addApiKey(
        { type: 'apiKey', name: 'x-api-key', in: 'header' },
        'x-api-key'
      )
      .build();

    const document = SwaggerModule.createDocument(app, options, {
      include: whitelistAPIDocs.map((wlModule) => AVAILABLE_MODULES[wlModule]),
    });

    SwaggerModule.setup('api/v1/docs', app, document);
  }

  await app.listen(3000);
}
bootstrap();
