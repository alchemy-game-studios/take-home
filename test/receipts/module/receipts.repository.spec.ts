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
import { mockPrismaService } from 'test/mock-prisma-service';

describe('RecieptsRepository', () => {
  let prismaService: PrismaService;
  let receiptsRepository: ReceiptsRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ReceiptsController],
      providers: [
        { provide: PrismaService, useValue: mockPrismaService },
        ReceiptsService,
        ReceiptsRepository,
        PointRules,
      ],
    }).compile();

    prismaService = moduleRef.get(PrismaService);
    receiptsRepository = moduleRef.get(ReceiptsRepository);
  });

  it('can get receipt points by id', async () => {
    const receiptModel = ExampleFactory.receiptModelExample();
    prismaService.receipt.findFirst = jest.fn().mockReturnValueOnce(receiptModel);

    const receiptReferenceDto = new ReceiptReferenceDTO();
    receiptReferenceDto.id = ExampleFactory.uuidExamples[ExampleFactory.defaultExampleIndex];

    const pointsDto = new PointsDTO();
    pointsDto.points = ExampleFactory.examplePoints;

    const result: PointsDTO = await receiptsRepository.getPointsByReceiptId(receiptReferenceDto);

    expect(prismaService.receipt.findFirst).toHaveBeenCalledWith({
      where: {
        id: ExampleFactory.uuidExamples[ExampleFactory.defaultExampleIndex],
      },
    });
    expect(result).toStrictEqual(pointsDto);
  });

  it('can create a receipt', async () => {
    //// Set up model objects
    // Receipt
    const receiptObject = ExampleFactory.receiptModelExample();

    // Receipt Items
    const numReceiptItems: number = 3;
    const receiptItems = [];
    for (let i = 0; i < numReceiptItems; i++) {
      receiptItems.push(ExampleFactory.receiptItemModelExample(i));
    }

    //// Set up input object
    const receipt: ReceiptDTO = ExampleFactory.receiptInputExampleFromModel(numReceiptItems);

    //// Spy on model call & mock db returns
    prismaService.receipt.create = jest.fn().mockResolvedValue(receiptObject);

    //// Perform test function
    const result: ReceiptReferenceDTO = await receiptsRepository.createReceipt(receipt);

    //// Expect results
    const expectedResult: ReceiptReferenceDTO = new ReceiptReferenceDTO();
    expectedResult.id = ExampleFactory.uuidExamples[ExampleFactory.defaultExampleIndex];

    expect(result).toStrictEqual(expectedResult);
    expect(prismaService.receipt.create).toHaveBeenCalledTimes(1);
  });
});
