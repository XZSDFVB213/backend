import { IsPhoneNumber, IsNotEmpty } from 'class-validator';

export class RequestResetDto {
  @IsPhoneNumber('RU') // измени под свою страну при необходимости
  @IsNotEmpty()
  phone!: string;
}
