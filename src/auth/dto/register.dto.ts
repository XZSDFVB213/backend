/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsEmail, IsString } from 'class-validator';

export class RegisterDto {
  @IsString({ message: 'Имя должно быть строкой' })
  name!: string;
  @IsEmail()
  email!: string;
  @IsString({ message: 'Пароль должен быть строкой' })
  password!: string;
}
