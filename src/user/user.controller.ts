import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpCode,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './create.user.dto';
import { UpdateUserDto } from './update.user.dto';
import { PatchUserDto } from './patch.user.dto';
import { LogIntecerptor } from '../interceptors/log.interceptor';
import { User } from '@prisma/client';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../guards/auth.guard';
import { UserDecorator } from '../decorators/user.decorator';

@UseInterceptors(LogIntecerptor)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll(): Promise<object> {
    return await this.userService.findAll();
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return await this.userService.findById(id);
  }

  @Post()
  async create(@Body() user: CreateUserDto): Promise<User> {
    return await this.userService.create(user);
  }

  @Patch(':id')
  async updatePartial(
    @Param('id', ParseIntPipe) id: number,
    @Body() userData: PatchUserDto,
  ): Promise<User> {
    return this.userService.updatePartial(id, userData);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateUserDto,
  ): Promise<User> {
    return this.userService.update(id, data);
  }

  @HttpCode(204)
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.userService.delete(id);
  }

  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(AuthGuard)
  @Post('photo')
  async uploadPhoto(
    @UserDecorator() user: User,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          //TO DO Pipes personalizados para processamento de imagem aqui...
          new FileTypeValidator({ fileType: 'image/png' }),
          new MaxFileSizeValidator({ maxSize: 1024 * 310 }),
        ],
      }),
    )
    photo: Express.Multer.File,
  ) {
    return this.userService.uploadPhoto(user, photo);
  }

  @UseInterceptors(FilesInterceptor('file', 5))
  @UseGuards(AuthGuard)
  @Post('photos')
  async uploadPhotos(
    @UserDecorator() user: User,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          //TO DO Pipes personalizados para processamento de imagem aqui...
          new FileTypeValidator({ fileType: 'image/png' }),
          new MaxFileSizeValidator({ maxSize: 1024 * 310 }),
        ],
      }),
    )
    photos: Express.Multer.File[],
  ) {
    console.log(photos.length);
    return this.userService.uploadPhotos(user, photos);
  }
}
