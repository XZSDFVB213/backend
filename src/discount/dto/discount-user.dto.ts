import { IsDateString, IsOptional, IsString } from 'class-validator';

export class DiscountUsedDto {
  @IsString()
  cardNumber!: string;

  @IsOptional()
  @IsDateString()
  usedAt?: string;

  @IsOptional()
  @IsString()
  receiptNumber?: string;

  @IsOptional()
  @IsString()
  purchasedFrom?: string;
}
