import { ReceiptDTO } from 'src/receipts/dto/receipt';
import { ReceiptItemDTO } from 'src/receipts/dto/receipt-item';

/*
 * Factory to create test data examples.
 */
export class ExampleFactory {
  static defaultExampleIndex: number = 0;

  static readonly uuidExamples: string[] = [
    'b9edea74-b36a-4a09-8355-4e2d29ad6aea',
    'a6e33f03-7ce7-4ce3-b632-41fc2e1c1190',
    '489671a4-7640-4256-96c8-3e532b3697a8',
    '14acef3b-0d98-4996-ba38-dc51cde29c5c',
    'e459c85d-38a7-4e63-a587-3046ef7a21cd',
    'bd95c3b3-5578-4139-9f14-461f0413a240',
    '6af3230a-a2ee-4e19-a432-ad33ebbb035e',
    '54622830-fd89-438a-ac1a-d153bf4cdbe7',
    '45be3356-7ffc-40c1-a1e6-e3b9fac0f943',
    'ea1f72e4-9463-41b7-9deb-5fccfd4085ab',
  ];

  static readonly examplePoints = 777;
  static readonly createDt: Date = new Date('2024-11-21T10:51:33');
  static readonly updateDt: Date = new Date('2024-11-22T22:04:11');
  static readonly purchaseDt: Date = new Date('2024-11-21T10:50');

  static receiptInputExamples = [
    {
      retailer: 'Target',
      purchaseDate: '2022-01-01',
      purchaseTime: '13:01',
      items: [
        {
          shortDescription: 'Mountain Dew 12PK',
          price: '6.49',
        },
        {
          shortDescription: 'Emils Cheese Pizza',
          price: '12.25',
        },
        {
          shortDescription: 'Knorr Creamy Chicken',
          price: '1.26',
        },
        {
          shortDescription: 'Doritos Nacho Cheese',
          price: '3.35',
        },
        {
          shortDescription: '   Klarbrunn 12-PK 12 FL OZ  ',
          price: '12.00',
        },
      ],
      total: '35.35',
    },
    {
      retailer: 'M&M Corner Market',
      purchaseDate: '2022-03-20',
      purchaseTime: '14:33',
      items: [
        {
          shortDescription: 'Gatorade',
          price: '2.25',
        },
        {
          shortDescription: 'Gatorade',
          price: '2.25',
        },
        {
          shortDescription: 'Gatorade',
          price: '2.25',
        },
        {
          shortDescription: 'Gatorade',
          price: '2.25',
        },
      ],
      total: '9.00',
    },
  ];

  static receiptInputExamplesE2E = [
    {
      retailer: 'Target',
      purchaseDate: '2022-01-01',
      purchaseTime: '13:01:00',
      items: [
        {
          shortDescription: 'Mountain Dew 12PK',
          price: '6.49',
        },
        {
          shortDescription: 'Emils Cheese Pizza',
          price: '12.25',
        },
        {
          shortDescription: 'Knorr Creamy Chicken',
          price: '1.26',
        },
        {
          shortDescription: 'Doritos Nacho Cheese',
          price: '3.35',
        },
        {
          shortDescription: '   Klarbrunn 12-PK 12 FL OZ  ',
          price: '12.00',
        },
      ],
      total: '35.35',
    },
    {
      retailer: 'M&M Corner Market',
      purchaseDate: '2022-03-20',
      purchaseTime: '14:33:00',
      items: [
        {
          shortDescription: 'Gatorade',
          price: '2.25',
        },
        {
          shortDescription: 'Gatorade',
          price: '2.25',
        },
        {
          shortDescription: 'Gatorade',
          price: '2.25',
        },
        {
          shortDescription: 'Gatorade',
          price: '2.25',
        },
      ],
      total: '9.00',
    },
  ];

  ////// Model factories
  static receiptModelExample(index: number = this.defaultExampleIndex) {
    return {
      id: this.uuidExamples[index],
      retailer: `Testing & Retailer - ${index}`,
      purchaseDate: '2022-03-05',
      purchaseTime: '14:32',
      total: 50.0,
      points: this.examplePoints,
      createdAt: this.createDt,
      updatedAt: this.updateDt,
    };
  }

  static receiptItemModelExample(index: number = this.defaultExampleIndex) {
    return {
      id: this.uuidExamples[index + 1],
      receiptId: this.uuidExamples[this.defaultExampleIndex],
      shortDescription: `Item ${index}`,
      price: 5.25,
      createdAt: this.createDt,
      updatedAt: this.updateDt,
    };
  }

  ////// Input Factories With Models as Starting Point
  static receiptInputExampleFromModel(numItems: number, index: number = this.defaultExampleIndex) {
    const modelExample = this.receiptModelExample(index);
    const receiptDto: ReceiptDTO = new ReceiptDTO();

    receiptDto.retailer = modelExample.retailer;
    receiptDto.points = modelExample.points;
    receiptDto.purchaseDate = modelExample.purchaseDate;
    receiptDto.purchaseTime = modelExample.purchaseTime;
    receiptDto.total = modelExample.total;
    receiptDto.items = [];

    for (let i = 0; i < numItems; i++) {
      receiptDto.items.push(this.receiptItemInputExampleFromModel(i));
    }

    return receiptDto;
  }

  static receiptItemInputExampleFromModel(index: number = this.defaultExampleIndex) {
    const receiptItemDto: ReceiptItemDTO = new ReceiptItemDTO();
    receiptItemDto.shortDescription = `Item ${index}`;
    receiptItemDto.price = 5.25;
    return receiptItemDto;
  }

  ///// Points
  static pointsDtoInputExample(points: number = this.examplePoints) {
    return {
      points: points,
    };
  }
}
