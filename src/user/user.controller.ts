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
  findAll(): object {
    return this.userService.findAll();
  }

  @Get(':id')
  show(@Param('id', ParseIntPipe) id: number): object {
    return this.userService.show(id);
  }

  @Post()
  save(@Body() user: CreateUserDto): object {
    return this.userService.save(user);
  }

  @Patch(':id')
  updatePartial(
    @Param('id', ParseIntPipe) id: number,
    @Body() userData: PatchUserDto,
  ): object {
    return this.userService.updatePartial(id, userData);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() userData: UpdateUserDto,
  ): object {
    return this.userService.update(id, userData);
  }

  @HttpCode(204)
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    this.userService.delete(id);
  }
}
