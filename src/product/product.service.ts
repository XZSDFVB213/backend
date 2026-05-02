/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { BadRequestException, Injectable } from '@nestjs/common';
// import { CreateProductDto } from './dto/create-product.dto';
// import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Product } from '@prisma/client';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}
  // create(createProductDto: CreateProductDto) {
  //   return 'This action adds a new product';
  // }

  async findAll(): Promise<Product[]> {
    const products = await this.prisma.product.findMany();
    if (products.length === 0) {
      throw new BadRequestException('Products not found');
    }
    return products;
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.prisma.product.findUnique({
      where: {
        id,
      },
    });
    if (!product) {
      throw new BadRequestException('Product not found');
    }
    return product;
  }

  // update(id: number, updateProductDto: UpdateProductDto) {
  //   return `This action updates a #${id} product`;
  // }

  remove(id: string) {
    return this.prisma.product.delete({ where: { id } });
  }
}
