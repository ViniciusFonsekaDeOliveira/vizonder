import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthLoginDTO } from './auth.login.dto';
import { AuthService } from './auth.service';
import { AuthRegisterDTO } from './auth.register.dto';
import { AuthRecoverDTO } from './auth.recover.dto';
import { AuthResetDTO } from './auth.reset.dto';
import { AuthGuard } from './auth.guard';
import { User } from '../decorators/user.decorator';

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

  //Rota Get Protegida
  @UseGuards(AuthGuard)
  @Get('me')
  async dashboard(@User() user) {
    return { user };
  }
}
