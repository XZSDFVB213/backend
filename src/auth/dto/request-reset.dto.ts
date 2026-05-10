import { IsNotEmpty, IsEmail } from 'class-validator';

export class RequestResetDto {
  @IsEmail() // измени под свою страну при необходимости
  @IsNotEmpty()
  email!: string;
}
