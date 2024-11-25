import { Injectable } from '@nestjs/common';
import { ReceiptDTO } from '../dto/receipt';
import { PointsDTO } from '../dto/points';
import { PointRules } from '../point-rules';
import { ReceiptReferenceDTO } from '../dto/receipt-reference';
import { ReceiptsRepository } from './receipts.repository';
import { DateTime } from 'luxon';

@Injectable()
export class ReceiptsService {
  constructor(
    private readonly receiptsRepository: ReceiptsRepository,
    private readonly pointRules: PointRules
  ) {}

  async getPointsByReceiptId(referenceDto: ReceiptReferenceDTO): Promise<PointsDTO> {
    return await this.receiptsRepository.getPointsByReceiptId(referenceDto);
  }

  async createReceipt(receipt: ReceiptDTO): Promise<ReceiptReferenceDTO> {
    this.transformToDateTime(receipt);

    receipt.points = await this.pointRules.calculatePoints(receipt);

    return await this.receiptsRepository.createReceipt(receipt);
  }

  /*
    Timezone is unclear from the API, so we assume local time.
    Might want to persist the local timezone as well for consistency across clients.
  */
  transformToDateTime(receipt: ReceiptDTO) {
    receipt.purchaseDateTime = DateTime.fromISO(`${receipt.purchaseDate}T${receipt.purchaseTime}`);
  }
}
