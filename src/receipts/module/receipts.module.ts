import { Module, MiddlewareConsumer } from '@nestjs/common';
import { ReceiptsController } from './receipts.controller';
import { ReceiptsService } from './receipts.service';
import { ConfigModule } from '@nestjs/config';
import { PointRules } from '../point-rules';
import { ReceiptsRepository } from './receipts.repository';
import { PrismaService } from 'src/prisma.service';
import { middleware } from 'express-openapi-validator';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`env/.env.${process.env.NODE_ENV}`],
    }),
  ],
  controllers: [ReceiptsController],
  providers: [PrismaService, ReceiptsService, ReceiptsRepository, PointRules],
})
export class ReceiptsModule {
  configure(consumer: MiddlewareConsumer) {
    middleware({
      apiSpec: `api.yml`,
      validateRequests: true,
      validateResponses: false,
    }).forEach((value) => consumer.apply(value).forRoutes(ReceiptsController));
  }
}
