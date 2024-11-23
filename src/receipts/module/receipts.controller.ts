import { Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ReceiptsService } from './receipts.service';
import { Param, Body } from '@nestjs/common';
import { ReceiptDTO } from '../dto/receipt';
import { PointsDTO } from '../dto/points';
import { ReceiptReferenceDTO } from '../dto/receipt-reference';
import { validate } from 'class-validator';

@Controller('receipts')
export class ReceiptsController {
  constructor(private readonly receiptsService: ReceiptsService) {}

  @Get(':id/points')
  async getReceiptPoints(@Param('id') id: string): Promise<PointsDTO> {
    const referenceDto: ReceiptReferenceDTO = new ReceiptReferenceDTO();
    referenceDto.id = id;
    validate(referenceDto);

    return await this.receiptsService.getPointsByReceiptId(referenceDto);
  }

  @Post('process')
  @HttpCode(HttpStatus.OK)
  async postReceiptProcess(@Body() receipt: ReceiptDTO): Promise<ReceiptReferenceDTO> {
    return await this.receiptsService.createReceipt(receipt);
  }
}
