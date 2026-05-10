import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsNotEmpty()
  @MinLength(4)
  code!: string;

  @IsNotEmpty()
  @MinLength(8)
  newPassword!: string;
}
