import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { AuthRegisterDTO } from './auth.register.dto';
import { AuthLoginDTO } from './auth.login.dto';
import { AuthRecoverDTO } from './auth.recover.dto';
import { AuthResetDTO } from './auth.reset.dto';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  private issuer = 'login';
  private audience = 'users';

  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  createToken(user: User) {
    return {
      acessToken: this.jwtService.sign(
        {
          id: user.id,
          name: user.nickname,
          email: user.email,
        },
        {
          subject: String(user.id),
          expiresIn: '7 days',
          issuer: this.issuer,
          audience: this.audience,
        },
      ),
    };
  }

  verifyToken(token: string) {
    token = this.parseToken(token);
    try {
      const data = this.jwtService.verify(token, {
        audience: this.audience,
        issuer: this.issuer,
      });
      return data;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  isValidToken(token: string) {
    try {
      this.verifyToken(token);
      return true;
    } catch (e) {
      return false;
    }
  }

  //Remove o bearer vindo do header se houver
  parseToken(token: string): string {
    const validToken = (token ?? '').split(' ');
    return validToken.length == 2
      ? (token = validToken[1])
      : (token = validToken[0]);
  }

  async login({ email, password }: AuthLoginDTO) {
    const user = await this.userService.findByEmailAndPassword(email, password);
    if (!user) {
      throw new UnauthorizedException('Dados incorretos!');
    }
    return this.createToken(user);
  }

  async register(userData: AuthRegisterDTO) {
    const user = await this.userService.create(userData);
    return this.createToken(user);
  }

  async recover({ email }: AuthRecoverDTO) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Email não encontrado!');
    }

    //TO DO: enviar o e-mail...

    return true;
  }

  async reset({ token, password }: AuthResetDTO) {
    //TO DO: validar o token
    //Extrair id do token
    console.log(token);
    const id = 0;
    const user = await this.userService.updatePartial(id, { password });
    return this.createToken(user);
  }
}
