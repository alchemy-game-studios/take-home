import { PrismaService } from '../../prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ReceiptDTO } from '../dto/receipt';
import { PointsDTO } from '../dto/points';
import { ReceiptReferenceDTO } from '../dto/receipt-reference';
import { DateTime } from 'luxon';

@Injectable()
export class ReceiptsRepository {
  constructor(private prisma: PrismaService) {}

  async getPointsByReceiptId(referenceDto: ReceiptReferenceDTO): Promise<PointsDTO> {
    const foundReceipt = await this.prisma.receipt.findFirst({
      where: { id: referenceDto.id },
    });

    if (foundReceipt !== null) {
      const pointsDto = new PointsDTO();
      pointsDto.points = foundReceipt.points;

      return pointsDto;
    } else {
      throw new NotFoundException();
    }
  }

  async createReceipt(receipt: ReceiptDTO): Promise<ReceiptReferenceDTO> {
    const createdReceipt = await this.prisma.receipt.create({
      data: {
        retailer: receipt.retailer,
        purchaseDateTime: DateTime.fromISO(`${receipt.purchaseDate}T${receipt.purchaseTime}`).toJSDate(),
        total: receipt.total,
        points: receipt.points,
      },
    });

    const receiptItemModels = receipt.items.map((receiptItem) => {
      return {
        receiptId: createdReceipt.id,
        shortDescription: receiptItem.shortDescription,
        price: receiptItem.price,
      };
    });

    for (const itemModel of receiptItemModels) {
      this.prisma.receiptItem.create({ data: itemModel });
    }

    const referenceDto = new ReceiptReferenceDTO();
    referenceDto.id = createdReceipt.id;

    return referenceDto;
  }
}
