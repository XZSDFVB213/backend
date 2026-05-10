import { IsPhoneNumber, IsString } from 'class-validator';
export class LoginDto {
  @IsPhoneNumber()
  phone!: string;
  @IsString({ message: 'Пароль должен быть строкой' })
  password!: string;
}
