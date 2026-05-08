/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsPhoneNumber, IsString, IsBoolean, IsEnum } from 'class-validator';
import { City } from '@prisma/client'; // ← должен работать после prisma generate

export class RegisterDto {
  @IsString()
  name!: string;

  @IsPhoneNumber()
  phone!: string;

  @IsString()
  password!: string;

  @IsBoolean()
  agree!: boolean;

  @IsBoolean()
  acceptedPolicy!: boolean;

  @IsEnum(City) // ← исправь вот так
  city!: City;
}
