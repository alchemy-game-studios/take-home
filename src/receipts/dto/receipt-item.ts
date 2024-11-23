import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty, Min } from 'class-validator';
import { PropertyTransforms } from 'src/receipts/dto/property-transforms';

export class ReceiptItemDTO {
  @IsNotEmpty()
  @IsString()
  shortDescription: string;

  @Transform(({ value }) => PropertyTransforms.currency(value))
  @IsNotEmpty()
  @Min(0)
  price: number;
}
