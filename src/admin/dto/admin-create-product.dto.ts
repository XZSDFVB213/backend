import { IsInt, IsString, Min } from 'class-validator';

export class AdminCreateProductDto {
  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsInt()
  @Min(0)
  price!: number;

  @IsString()
  image!: string;

  @IsString()
  category!: string;

  @IsString()
  subcategory!: string;

  @IsInt()
  @Min(0)
  stock!: number;
}
