import { ReceiptDTO } from 'src/receipts/dto/receipt';
import { ExampleFactory } from '../examples/example-factory';
import { plainToInstance } from 'class-transformer';
import { DateTime } from 'luxon';
import { ReceiptItemDTO } from 'src/receipts/dto/receipt-item';
import { PointRules } from 'src/receipts/point-rules';

/*
 * A set of helper functions to abstract setting up expectations and running tests
 * for Rules.
 */
export class PointRulesTestRunners {
  generateReceiptDtoExamples(): ReceiptDTO[] {
    const examples: ReceiptDTO[] = [
      plainToInstance(ReceiptDTO, ExampleFactory.receiptInputExamples[0]),
      plainToInstance(ReceiptDTO, ExampleFactory.receiptInputExamples[1]),
    ];

    for (const example of examples) {
      example.purchaseDateTime = DateTime.fromISO(`${example.purchaseDate}T${example.purchaseTime}`);
    }

    return examples;
  }

  async checkRule(propertyName: string, propertyValue, expectedPoints: number, ruleFn) {
    const receipt: ReceiptDTO = this.generateReceiptDtoExamples()[0];
    receipt[propertyName] = propertyValue;

    const result = await ruleFn(receipt);

    expect(result).toBe(expectedPoints);
  }

  checkItemRule(numItems: number, expectedPoints: number, ruleFn, descriptions: string[] = null, price: number = -1) {
    const items: ReceiptItemDTO[] = [];
    for (let i = 0; i < numItems; i++) {
      const example = ExampleFactory.receiptItemInputExampleFromModel();

      if (descriptions != null && descriptions.length > i) {
        example.shortDescription = descriptions[i];
      }

      if (price >= 0) {
        example.price = price;
      }
      items.push(example);
    }

    this.checkRule('items', items, expectedPoints, ruleFn);
  }

  checkPurchaseDateTime(date: string, expectedPoints: number, rulefn) {
    this.checkRule('purchaseDateTime', DateTime.fromISO(date), expectedPoints, rulefn);
  }

  checkPoints(expectedPoints, receiptDtoExample) {
    const pointRules: PointRules = new PointRules();

    pointRules.calculatePoints(receiptDtoExample).then((total) => {
      expect(total).toBe(expectedPoints);
    });
  }
}
