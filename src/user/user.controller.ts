import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './create.user.dto';
import { UpdateUserDto } from './update.user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll(): object {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): object {
    return this.userService.findOne(id);
  }

  @Post()
  save(@Body() user: CreateUserDto): object {
    return this.userService.save(user);
  }

  @Patch(':id')
  updatePartial(@Param() id: number, @Body() userData: UpdateUserDto): object {
    return this.userService.updatePartial(id, userData);
  }

  @Put(':id')
  update(@Param() id: number, @Body() userData: UpdateUserDto): object {
    return this.userService.update(id, userData);
  }

  @HttpCode(204)
  @Delete(':id')
  delete(@Param('id') id: number) {
    this.userService.delete(id);
  }
}
