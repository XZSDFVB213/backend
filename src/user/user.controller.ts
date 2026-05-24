import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Post,
  Headers,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Post('subscription/activate')
  activateSubscription(
    @Body() dto: { phone: string; days: number },
    @Headers('x-staff-key') staffKey: string,
  ) {
    if (staffKey !== process.env.STAFF_KEY) {
      throw new Error('Unauthorized');
    }
    return this.userService.activateSubscription(dto);
  }
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
