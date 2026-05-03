/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsPhoneNumber, IsString } from 'class-validator';

export class RegisterDto {
  @IsString({ message: 'Имя должно быть строкой' })
  name!: string;
  @IsPhoneNumber()
  phone!: string;
  @IsString({ message: 'Пароль должен быть строкой' })
  password!: string;
}
