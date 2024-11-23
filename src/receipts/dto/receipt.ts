import { Exclude, Transform, Type } from 'class-transformer';
import { IsNotEmpty, Min, ArrayMinSize, IsInt, IsString, IsOptional, ValidateNested } from 'class-validator';
import { ReceiptItemDTO } from './receipt-item';
import { PropertyTransforms } from 'src/receipts/dto/property-transforms';
import { DateTime } from 'luxon';

export class ReceiptDTO {
  @IsNotEmpty()
  retailer: string;

  @IsString()
  @IsNotEmpty()
  purchaseDate: string;

  @IsString()
  @IsNotEmpty()
  purchaseTime: string;

  @Exclude()
  purchaseDateTime: DateTime;

  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReceiptItemDTO)
  items: ReceiptItemDTO[];

  @Transform(({ value }) => PropertyTransforms.currency(value))
  @IsNotEmpty()
  @Min(0)
  total: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  points: number;
}
