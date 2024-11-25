import { Controller, Get, HttpCode, HttpStatus, NotFoundException, Post } from '@nestjs/common';
import { ReceiptsService } from './receipts.service';
import { Param, Body } from '@nestjs/common';
import { ReceiptDTO } from '../dto/receipt';
import { PointsDTO } from '../dto/points';
import { ReceiptReferenceDTO } from '../dto/receipt-reference';

@Controller('receipts')
export class ReceiptsController {
  constructor(private readonly receiptsService: ReceiptsService) {}

  @Get(':id/points')
  async getReceiptPoints(@Param() referenceDto: ReceiptReferenceDTO): Promise<PointsDTO> {
    const result: PointsDTO = await this.receiptsService.getPointsByReceiptId(referenceDto);

    if (result === null) {
      throw new NotFoundException();
    }

    return result;
  }

  @Post('process')
  @HttpCode(HttpStatus.OK)
  async postReceiptProcess(@Body() receipt: ReceiptDTO): Promise<ReceiptReferenceDTO> {
    return await this.receiptsService.createReceipt(receipt);
  }
}
