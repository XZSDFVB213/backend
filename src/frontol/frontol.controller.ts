// src/frontol/frontol.controller.ts
import { Controller, Post, Body, Headers } from '@nestjs/common';
import { FrontolService } from './frontol.service';

@Controller('frontol')
export class FrontolController {
  constructor(private frontolService: FrontolService) {}

  @Post()
  async handle(@Body() body: any, @Headers('x-access-key') accessKey: string) {
    if (!this.frontolService.validateAccessKey(accessKey)) {
      return { success: false, error: 'Access denied' };
    }

    return this.frontolService.handleRequest(body);
  }
}
