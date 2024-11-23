import { Test } from '@nestjs/testing';
import { ReceiptsController } from 'src/receipts/module/receipts.controller';
import { ReceiptsService } from 'src/receipts/module/receipts.service';
import { PointsDTO } from 'src/receipts/dto/points';
import { ReceiptReferenceDTO } from 'src/receipts/dto/receipt-reference';
import { ReceiptDTO } from 'src/receipts/dto/receipt';
import { ReceiptsRepository } from 'src/receipts/module/receipts.repository';
import { PointRules } from 'src/receipts/point-rules';
import { PrismaService } from 'src/prisma.service';
import { ExampleFactory } from 'test/receipts/examples/example-factory';

describe('RecieptsController', () => {
  let receiptsController: ReceiptsController;
  let receiptsService: ReceiptsService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ReceiptsController],
      providers: [PrismaService, ReceiptsService, ReceiptsRepository, PointRules],
    }).compile();

    receiptsController = moduleRef.get(ReceiptsController);
    receiptsService = moduleRef.get(ReceiptsService);
  });

  it('can get receipt points by id', async () => {
    const receiptId: string = ExampleFactory.uuidExamples[ExampleFactory.defaultExampleIndex];

    const serviceResult = new PointsDTO();
    serviceResult.points = ExampleFactory.examplePoints;

    jest.spyOn(receiptsService, 'getPointsByReceiptId').mockImplementation(
      () =>
        new Promise<PointsDTO>((resolve) => {
          resolve(serviceResult);
        })
    );

    const result: PointsDTO = await receiptsController.getReceiptPoints(receiptId);

    expect(result).toBe(serviceResult);
  });

  it('can process a receipt', async () => {
    const numItems: number = 3;
    const receipt: ReceiptDTO = ExampleFactory.receiptInputExampleFromModel(numItems);

    const serviceResult = new ReceiptReferenceDTO();
    serviceResult.id = ExampleFactory.uuidExamples[ExampleFactory.defaultExampleIndex];

    jest.spyOn(receiptsService, 'createReceipt').mockImplementation(
      () =>
        new Promise<ReceiptReferenceDTO>((resolve) => {
          resolve(serviceResult);
        })
    );

    const result: ReceiptReferenceDTO = await receiptsController.postReceiptProcess(receipt);

    expect(result).toBe(serviceResult);
  });
});
