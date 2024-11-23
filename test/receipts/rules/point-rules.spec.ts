import { PointRules } from 'src/receipts/point-rules';
import { ReceiptDTO } from 'src/receipts/dto/receipt';
import { PointRulesTestRunners } from './point-rules-test-runners';
import { PointRulesConfig } from 'src/receipts/point-rules-config';

const pointRulesConfig: PointRulesConfig = new PointRulesConfig();
const config = pointRulesConfig.config;

describe('PointRules', () => {
  let pointRules: PointRules;
  let receiptDtoExamples: ReceiptDTO[];
  let pointRulesTestRunners: PointRulesTestRunners;

  beforeEach(() => {
    pointRules = new PointRules();
    pointRulesTestRunners = new PointRulesTestRunners();
    receiptDtoExamples = pointRulesTestRunners.generateReceiptDtoExamples();
  });

  describe('calculatePoints', () => {
    it('should return correct point totals', () => {
      pointRulesTestRunners.checkPoints(28, receiptDtoExamples[0]);
      pointRulesTestRunners.checkPoints(109, receiptDtoExamples[1]);
    });

    it('should throw an error if a rule fails', () => {
      const error: Error = new Error();

      pointRules.RULES[0] = jest.fn().mockRejectedValue(error);

      pointRules
        .calculatePoints(receiptDtoExamples[1])
        .then(() => {
          fail();
        })
        .catch((err) => {
          expect(err).toBe(error);
        });
    });
  });

  describe('retailerNameCharacters', () => {
    const checkRetailer = (retailer: string, expectedPoints: number) => {
      pointRulesTestRunners.checkRule('retailer', retailer, expectedPoints, pointRules.retailerNameCharacters);
    };

    it('should return correct number of points', () => {
      checkRetailer('1A  NaMe & 1078      #).,?!', 10);
      checkRetailer('', 0);
      checkRetailer('&#(#$)%*(),.', 0);
      checkRetailer('OnlyAlphaNumeric1000', 20);
      checkRetailer('A simple & example', 14);
    });
  });

  describe('totalRoundCurrencyAmount', () => {
    const checkTotalMultiple = (total: number, expectedPoints: number) => {
      pointRulesTestRunners.checkRule('total', total, expectedPoints, pointRules.totalRoundCurrencyAmount);
    };

    const pointAward: number = config.totalRoundCurrencyAmount.matchPointTotal;
    const defaultPoints: number = config.global.defaultPoints;

    it('should return correct number of points', () => {
      checkTotalMultiple(0.0, pointAward);
      checkTotalMultiple(5.01, defaultPoints);
      checkTotalMultiple(4.99, defaultPoints);
      checkTotalMultiple(5999999.0, pointAward);
    });
  });

  describe('totalMultiple', () => {
    const checkTotalMultiple = (total: number, expectedPoints: number) => {
      pointRulesTestRunners.checkRule('total', total, expectedPoints, pointRules.totalMultiple);
    };

    const pointAward: number = config.totalMultiple.matchPointTotal;
    const defaultPoints: number = config.global.defaultPoints;

    it('should return correct number of points', () => {
      checkTotalMultiple(5.25, pointAward);
      checkTotalMultiple(7.0, pointAward);
      checkTotalMultiple(148.26, defaultPoints);
      checkTotalMultiple(0.25, pointAward);
      checkTotalMultiple(0.0, pointAward);
      checkTotalMultiple(0.01, defaultPoints);
      checkTotalMultiple(100.97, defaultPoints);
    });
  });

  describe('everyXItems', () => {
    const checkXItems = (numItems: number) => {
      const pointsPerX: number = config.everyXItems.matchPointTotal;
      const xItems: number = config.everyXItems.xItems;

      const points = Math.floor(numItems / xItems) * pointsPerX;

      pointRulesTestRunners.checkItemRule(numItems, points, pointRules.everyXItems);
    };

    it('should return correct number of points', () => {
      checkXItems(0);
      checkXItems(1);
      checkXItems(2);
      checkXItems(3);
      checkXItems(4);
      checkXItems(85);
      checkXItems(1000001);
    });
  });

  describe('itemDescriptionLengthMultiple', () => {
    // Different descriptions to test matching multiple
    const shortDescriptions: string[] = [
      'Simple description',
      '  Some trimming needed!    ',
      '  Trim & 0DD Ch@ract3rs ()#!7',
      '',
      '  not a multiple ', // Does not provide points
    ];

    // Different prices to test multiplier
    const prices: number[] = [
      0.0,
      1.0,
      4.51,
      567.01, // Provides 114 points
    ];

    const checkItemDescription = (descriptions: string[], price: number, expectedPoints: number) => {
      pointRulesTestRunners.checkItemRule(
        descriptions.length,
        expectedPoints,
        pointRules.itemDescriptionLengthMultiple,
        descriptions,
        price
      );
    };

    const checkItemDescriptionGroup = (descriptions: string[], numHits: number) => {
      checkItemDescription(descriptions, prices[0], 0);
      checkItemDescription(descriptions, prices[1], numHits);
      checkItemDescription(descriptions, prices[2], numHits);
      checkItemDescription(descriptions, prices[3], numHits * 114);
    };

    it('should return correct number of points', () => {
      checkItemDescriptionGroup([], 0);
      checkItemDescriptionGroup([shortDescriptions[3]], 1);
      checkItemDescriptionGroup([shortDescriptions[4]], 0);
      checkItemDescriptionGroup([shortDescriptions[0]], 1);
      checkItemDescriptionGroup([shortDescriptions[0], shortDescriptions[1]], 2);
      checkItemDescriptionGroup([shortDescriptions[0], shortDescriptions[1], shortDescriptions[2]], 3);
      checkItemDescriptionGroup(
        [shortDescriptions[0], shortDescriptions[1], shortDescriptions[2], shortDescriptions[4]],
        3
      );
    });
  });

  describe('purchaseDateParity', () => {
    const checkDateParity = (date: string, expectedPoints: number) => {
      pointRulesTestRunners.checkPurchaseDateTime(date, expectedPoints, pointRules.purchaseDateParity);
    };
    it('should return correct number of points', () => {
      const pointAward: number = config.purchaseDateParity.matchPointTotal;
      const defaultPoints: number = config.global.defaultPoints;

      checkDateParity('2021-04-00T13:41', defaultPoints); // Invalid day
      checkDateParity('2023-11-01T08:01', pointAward);
      checkDateParity('2022-07-17T14:07', pointAward);
      checkDateParity('2024-11-24T02:28', defaultPoints);
      checkDateParity('2024-05-31T00:00', pointAward);
    });
  });

  describe('purchaseTimeRange', () => {
    const checkTimeRange = (date: string, expectedPoints: number) => {
      pointRulesTestRunners.checkPurchaseDateTime(date, expectedPoints, pointRules.purchaseTimeRange);
    };
    it('should return correct number of points', () => {
      const pointAward = config.purchaseTimeRange.matchPointTotal;
      const defaultPoints: number = config.global.defaultPoints;

      checkTimeRange('2021-04-21T14:01', pointAward);
      checkTimeRange('2022-10-11T15:01', pointAward);
      checkTimeRange('2024-06-04T15:59', pointAward);
      checkTimeRange('2023-09-18T14:00', defaultPoints);
      checkTimeRange('2019-02-05T16:00', defaultPoints);
      checkTimeRange('2018-01-01T00:00', defaultPoints);
    });
  });
});
