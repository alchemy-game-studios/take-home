import { NestFactory } from '@nestjs/core';
import { ReceiptsModule } from './receipts/module/receipts.module';
import { ValidationPipe } from '@nestjs/common';
import { OpenApiExceptionFilter } from './exception-filters/openapi-exception-filter';

async function bootstrap() {
  const app = await NestFactory.create(ReceiptsModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      stopAtFirstError: true,
    })
  );

  app.useGlobalFilters(new OpenApiExceptionFilter());

  await app.listen(process.env.APP_PORT);
}
bootstrap();
