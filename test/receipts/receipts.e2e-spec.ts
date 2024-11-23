import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { ReceiptsModule } from 'src/receipts/module/receipts.module';
import { ExampleFactory } from './examples/example-factory';
import { PrismaService } from 'src/prisma.service';
import { mockPrismaService } from 'test/mock-prisma-service';
import { OpenApiExceptionFilter } from 'src/exception-filters/openapi-exception-filter';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

describe('ReceiptsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ReceiptsModule],
      providers: [{ provide: PrismaService, useValue: mockPrismaService }],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get(PrismaService);

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        stopAtFirstError: true,
      })
    );

    app.useGlobalFilters(new OpenApiExceptionFilter());

    await app.init();
  });

  describe('/receipts/process (POST)', () => {
    it('should return a 200', async () => {
      const receiptModelExample = ExampleFactory.receiptModelExample();
      prisma.receipt.create = jest.fn().mockResolvedValue(receiptModelExample);
      const body = ExampleFactory.receiptInputExamplesE2E[0];

      const res = await request(app.getHttpServer()).post('/receipts/process').send(body).expect(HttpStatus.OK);

      expect(res.body).toStrictEqual({ id: receiptModelExample.id });
    });

    it(`should return a 500 if the database transaction fails`, async () => {
      prisma.receipt.create = jest
        .fn()
        .mockRejectedValue(
          new PrismaClientKnownRequestError('An unknown error has occurred.', { clientVersion: '4.0.0', code: 'foo' })
        );
      const body = ExampleFactory.receiptInputExamplesE2E[0];

      await request(app.getHttpServer()).post(`/receipts/process`).send(body).expect(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe('/receipts/:id/points (GET)', () => {
    it(`should return a 200`, async () => {
      const receiptModelExample = ExampleFactory.receiptModelExample();
      prisma.receipt.findFirst = jest.fn().mockResolvedValue(receiptModelExample);

      const res = await request(app.getHttpServer())
        .get(`/receipts/${ExampleFactory.uuidExamples[0]}/points`)
        .expect(HttpStatus.OK);

      expect(res.body).toStrictEqual({ points: ExampleFactory.examplePoints });
    });

    it(`should return a 404 if the receipt does not exist`, async () => {
      prisma.receipt.findFirst = jest.fn().mockResolvedValue(null);

      await request(app.getHttpServer())
        .get(`/receipts/${ExampleFactory.uuidExamples[0]}/points`)
        .expect(HttpStatus.NOT_FOUND);
    });

    it(`should return a 500 if the database transaction fails`, async () => {
      prisma.receipt.findFirst = jest
        .fn()
        .mockRejectedValue(
          new PrismaClientKnownRequestError('An unknown error has occurred.', { clientVersion: '4.0.0', code: 'foo' })
        );

      await request(app.getHttpServer())
        .get(`/receipts/${ExampleFactory.uuidExamples[0]}/points`)
        .expect(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });
});
