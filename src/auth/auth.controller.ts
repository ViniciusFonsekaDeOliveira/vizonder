import { Body, Controller, Post } from '@nestjs/common';
import { AuthLoginDTO } from './auth.login.dto';
import { AuthService } from './auth.service';
import { AuthRegisterDTO } from './auth.register.dto';
import { AuthRecoverDTO } from './auth.recover.dto';
import { AuthResetDTO } from './auth.reset.dto';

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
    this.authService.recoverPassword(user);
  }

  @Post('reset')
  async reset(@Body() user: AuthResetDTO) {
    return this.authService.resetPassword(user);
  }
}
