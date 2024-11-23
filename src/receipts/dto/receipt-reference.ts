import { IsNotEmpty, IsUUID } from 'class-validator';

export class ReceiptReferenceDTO {
  @IsNotEmpty()
  @IsUUID()
  id: string;
}
