/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsEmail, IsString } from 'class-validator';
export class LoginDto {
  @IsEmail()
  email!: string;
  @IsString({ message: 'Пароль должен быть строкой' })
  password!: string;
}
