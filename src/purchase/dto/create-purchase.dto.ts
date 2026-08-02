import { IsString, IsNumber, IsDateString, IsOptional } from 'class-validator';

export class CreatePurchaseDto {
  @IsString()
  cardNumber!: string;

  @IsOptional()
  @IsString()
  receiptNumber?: string;

  @IsNumber()
  totalAmount!: number;

  @IsDateString()
  purchasedAt!: string;

  @IsString()
  purchasedFrom!: string;
}
