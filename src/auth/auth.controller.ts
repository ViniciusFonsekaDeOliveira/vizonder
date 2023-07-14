import {
  Body,
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthLoginDTO } from './auth.login.dto';
import { AuthService } from './auth.service';
import { AuthRegisterDTO } from './auth.register.dto';
import { AuthRecoverDTO } from './auth.recover.dto';
import { AuthResetDTO } from './auth.reset.dto';
import { AuthGuard } from './auth.guard';
import { User } from '../decorators/user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { writeFile } from 'fs/promises';
import { join } from 'path';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() user: AuthLoginDTO) {
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() user: AuthRegisterDTO) {
    return this.authService.register(user);
  }

  @Post('recover')
  async recover(@Body() user: AuthRecoverDTO) {
    this.authService.recover(user);
  }

  @Post('reset')
  async reset(@Body() user: AuthResetDTO) {
    return this.authService.reset(user);
  }

  //Rota Post protegida
  @UseGuards(AuthGuard)
  @Post('me')
  async me(@User('email') user) {
    return { user };
  }

  // //Rota Get Protegida
  // @UseGuards(AuthGuard)
  // @Get('me')
  // async dashboard(@User() user) {
  //   return { user };
  // }

  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(AuthGuard)
  @Post('photo')
  async uploadPhoto(
    @User() user,
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
    //Refatorar trecho de persistência de arquivo.
    await writeFile(
      join(__dirname, '..', '..', 'storage', 'pics', `pic-${user.id}.png`),
      photo.buffer,
    );

    return { success: true };
  }
}
