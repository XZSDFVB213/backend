/* eslint-disable @typescript-eslint/no-unsafe-call */
import { City } from '@prisma/client';
import { IsPhoneNumber, IsString, IsBoolean, IsEnum } from 'class-validator';

export class RegisterDto {
  @IsString({ message: 'Имя должно быть строкой' })
  name!: string;
  @IsPhoneNumber()
  phone!: string;
  @IsString({ message: 'Пароль должен быть строкой' })
  password!: string;
  @IsBoolean()
  agree!: boolean;
  @IsBoolean()
  acceptedPolicy!: boolean;
  @IsEnum([City])
  city!: City;
}
