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

describe('RecieptsService', () => {
  let receiptsService: ReceiptsService;
  let receiptsRepository: ReceiptsRepository;
  let pointRules: PointRules;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ReceiptsController],
      providers: [PrismaService, ReceiptsService, ReceiptsRepository, PointRules],
    }).compile();

    receiptsService = moduleRef.get(ReceiptsService);
    receiptsRepository = moduleRef.get(ReceiptsRepository);
    pointRules = moduleRef.get(PointRules);
  });

  it('can get receipt points by id', async () => {
    const pointsDto = new PointsDTO();
    const serviceResult = new Promise<PointsDTO>((resolve) => {
      pointsDto.points = ExampleFactory.examplePoints;

      resolve(pointsDto);
    });

    const repoSpy = jest.spyOn(receiptsRepository, 'getPointsByReceiptId').mockImplementation(() => serviceResult);
    const receiptReferenceDto: ReceiptReferenceDTO = new ReceiptReferenceDTO();
    receiptReferenceDto.id = ExampleFactory.uuidExamples[0];

    const result: PointsDTO = await receiptsService.getPointsByReceiptId(receiptReferenceDto);

    expect(result).toBe(pointsDto);
    expect(repoSpy).toHaveBeenCalledWith(receiptReferenceDto);
  });

  it('can create a receipt', async () => {
    const numItems = 3;
    const receipt: ReceiptDTO = ExampleFactory.receiptInputExampleFromModel(numItems);

    const referenceResult: ReceiptReferenceDTO = new ReceiptReferenceDTO();

    const repoResult = new Promise<ReceiptReferenceDTO>((resolve) => {
      referenceResult.id = ExampleFactory.uuidExamples[ExampleFactory.defaultExampleIndex];

      resolve(referenceResult);
    });

    const pointResult = new Promise<number>((resolve) => {
      resolve(ExampleFactory.examplePoints);
    });

    const pointSpy = jest.spyOn(pointRules, 'calculatePoints').mockImplementation(() => pointResult);
    const repoSpy = jest.spyOn(receiptsRepository, 'createReceipt').mockImplementation(() => repoResult);

    const result: ReceiptReferenceDTO = await receiptsService.createReceipt(receipt);

    expect(result).toBe(referenceResult);
    expect(pointSpy).toHaveBeenCalledWith(receipt);
    expect(repoSpy).toHaveBeenCalledWith(receipt);

    expect(receipt.points).toBeDefined();
    expect(receipt.points).toBe(ExampleFactory.examplePoints);
  });
});
