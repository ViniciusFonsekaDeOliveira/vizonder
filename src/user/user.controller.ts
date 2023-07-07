import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './create.user.dto';
import { UpdateUserDto } from './update.user.dto';
import { PatchUserDto } from './patch.user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll(): Promise<object> {
    return await this.userService.findAll();
  }

  @Get(':id')
  async show(@Param('id', ParseIntPipe) id: number): Promise<object> {
    return await this.userService.show(id);
  }

  @Post()
  async save(@Body() user: CreateUserDto): Promise<object> {
    return await this.userService.save(user);
  }

  @Patch(':id')
  async updatePartial(
    @Param('id', ParseIntPipe) id: number,
    @Body() userData: PatchUserDto,
  ): Promise<object> {
    return this.userService.updatePartial(id, userData);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateUserDto,
  ): Promise<object> {
    return this.userService.update(id, data);
  }

  @HttpCode(204)
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.userService.delete(id);
  }
}
