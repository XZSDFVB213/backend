import { IsString, IsNotEmpty, Length } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  @Length(4, 4)
  code!: string; // 4 цифры

  @IsString()
  @IsNotEmpty()
  @Length(6, 32)
  newPassword!: string;
}
