import { Injectable } from '@nestjs/common';
import { DateTime, Interval } from 'luxon';
import { ReceiptDTO } from 'src/receipts/dto/receipt';
import { PointRulesConfig } from './point-rules-config';

/*
* Class to encapsulate generating points for a receipt. New rules can be added
* by creating a function for the rule below (or group them elsewhere and include)
* them here. Add them to the RULES list below to automatically run and be added.
* Rules functions should conform to the Rule type.
* 
* Document the rule behavior in the README and refer to it as the source of truth.
*
* Rules constants and other setup can be configured in `points-rules-config.yml
*/
const pointRulesConfig: PointRulesConfig = new PointRulesConfig();
const config = pointRulesConfig.config;

type Rule = (receipt: ReceiptDTO) => Promise<number>;


@Injectable()
export class PointRules {
  readonly RULES: Rule[] = [
    this.retailerNameCharacters,
    this.totalRoundCurrencyAmount,
    this.totalMultiple,
    this.everyXItems,
    this.itemDescriptionLengthMultiple,
    this.purchaseDateParity,
    this.purchaseTimeRange,
  ];

  /**
   * Here we simulate using go routines, a wait group, and a channel to concurrently calculate
   * points for each rule and add them up when the routines are complete. In a
   * typical node.js environment, this is still single threaded and async
   * functions are not needed (unless external service calls are made).
   */
  async calculatePoints(receipt: ReceiptDTO): Promise<number> {
    return new Promise<number>(async (resolve, reject) => {
      try {
        let total: number = 0;
        const promises: Promise<number>[] = [];

        for (const rule of this.RULES) {
          promises.push(rule(receipt)); // Simulate go routine + channel
        }

        // Simulate wait group
        const points: number[] = await Promise.all(promises);

        total = points.reduce((accumulator, pointResult) => {
          return accumulator + pointResult;
        });
        resolve(total);
      } catch (e) {
        reject(e);
      }
    });
  }

  async retailerNameCharacters(receipt: ReceiptDTO): Promise<number> {
    // ASCII Ranges for Alphanumeric characters
    const digitRange: number[] = [48, 57];
    const upperRange: number[] = [65, 90];
    const lowerRange: number[] = [97, 122];

    let matchCount: number = 0;
    let charCode: number;
    let isValid: boolean;

    for (let i = 0; i < receipt.retailer.length; i++) {
      charCode = receipt.retailer.charCodeAt(i);
      isValid =
        (charCode >= digitRange[0] && charCode <= digitRange[1]) ||
        (charCode >= upperRange[0] && charCode <= upperRange[1]) ||
        (charCode >= lowerRange[0] && charCode <= lowerRange[1]);
      if (isValid) {
        matchCount++;
      }
    }

    return matchCount;
  }

  async totalRoundCurrencyAmount(receipt: ReceiptDTO): Promise<number> {
    const defaultTotal: number = config.global.defaultPoints;
    const matchPointTotal: number = config.totalRoundCurrencyAmount.matchPointTotal;

    const remainder: number = (receipt.total * 100) % 100;
    return remainder == 0 ? matchPointTotal : defaultTotal;
  }

  async totalMultiple(receipt: ReceiptDTO): Promise<number> {
    const defaultTotal: number = config.global.defaultPoints;
    const matchPointTotal: number = config.totalMultiple.matchPointTotal;
    const multiple: number = config.totalMultiple.multiple;

    const remainder: number = receipt.total % multiple;
    return remainder == 0 ? matchPointTotal : defaultTotal;
  }

  async everyXItems(receipt: ReceiptDTO): Promise<number> {
    const matchPointTotal: number = config.everyXItems.matchPointTotal;
    const xItems: number = config.everyXItems.xItems;

    return xItems === 0 ? config.global.defaultPoints : Math.floor(receipt.items.length / xItems) * matchPointTotal;
  }

  async itemDescriptionLengthMultiple(receipt: ReceiptDTO): Promise<number> {
    const multiple: number = config.itemDescriptionLengthMultiple.multiple;
    const priceMultiplier: number = config.itemDescriptionLengthMultiple.priceMultiplier;

    let points: number = 0;

    for (const item of receipt.items) {
      const trimmed = item.shortDescription.trim();

      if (trimmed.length % multiple == 0) {
        points += Math.ceil(item.price * priceMultiplier);
      }
    }

    return points;
  }

  async purchaseDateParity(receipt: ReceiptDTO): Promise<number> {
    const defaultTotal: number = config.global.defaultPoints;
    const matchPointTotal: number = config.purchaseDateParity.matchPointTotal;

    const dayIsOdd: boolean = !Number.isNaN(receipt.purchaseDateTime.day) && receipt.purchaseDateTime.day % 2 != 0;

    return dayIsOdd ? matchPointTotal : defaultTotal;
  }

  async purchaseTimeRange(receipt: ReceiptDTO): Promise<number> {
    const defaultTotal: number = config.global.defaultPoints;
    const matchPointTotal: number = config.purchaseTimeRange.matchPointTotal;

    const createTime = (hours: number, minutes: number) => {
      return DateTime.fromObject({
        year: receipt.purchaseDateTime.year,
        month: receipt.purchaseDateTime.month,
        day: receipt.purchaseDateTime.day,
        hour: hours,
        minute: minutes,
      });
    };

    const startTime: DateTime = createTime(
      config.purchaseTimeRange.hours.start,
      config.purchaseTimeRange.minutes.start
    );
    const endTime: DateTime = createTime(config.purchaseTimeRange.hours.end, config.purchaseTimeRange.minutes.end);

    // Inclusive start time, exclusive end time
    const timeInterval = Interval.fromDateTimes(startTime, endTime);
    const isInRange = timeInterval.contains(receipt.purchaseDateTime);

    return isInRange ? matchPointTotal : defaultTotal;
  }
}
