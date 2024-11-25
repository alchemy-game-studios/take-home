import { PrismaService } from '../../prisma.service';
import { Injectable } from '@nestjs/common';
import { ReceiptDTO } from '../dto/receipt';
import { PointsDTO } from '../dto/points';
import { ReceiptReferenceDTO } from '../dto/receipt-reference';
import { DateTime } from 'luxon';

@Injectable()
export class ReceiptsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getPointsByReceiptId(referenceDto: ReceiptReferenceDTO): Promise<PointsDTO> {
    const foundReceipt = await this.prisma.receipt.findFirst({
      where: { id: referenceDto.id },
    });

    if (foundReceipt !== null) {
      const pointsDto = new PointsDTO();
      pointsDto.points = foundReceipt.points;

      return pointsDto;
    } else {
      return null;
    }
  }

  async createReceipt(receipt: ReceiptDTO): Promise<ReceiptReferenceDTO> {
    const createdReceipt = await this.prisma.receipt.create({
      data: {
        retailer: receipt.retailer,
        purchaseDateTime: DateTime.fromISO(`${receipt.purchaseDate}T${receipt.purchaseTime}`).toJSDate(),
        total: receipt.total,
        points: receipt.points,
        items: {
          create: receipt.items, // Handles creating related records in a single transaction for idempotency
        },
      },
    });

    const referenceDto = new ReceiptReferenceDTO();
    referenceDto.id = createdReceipt.id;

    return referenceDto;
  }
}
