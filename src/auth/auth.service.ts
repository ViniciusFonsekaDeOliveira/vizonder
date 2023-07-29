import {
  BadRequestException,
  Inject,
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
import * as bcrypt from 'bcrypt';
import { MailerService } from '@nestjs-modules/mailer/dist';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class AuthService {
  private issuer = 'login';
  private audience = 'users';

  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly mailerService: MailerService,
    @Inject(CACHE_MANAGER)
    private readonly cacheService: Cache,
  ) {}

  async createToken(user: User) {
    const token = this.jwtService.sign(
      {
        id: user.id,
      },
      {
        subject: String(user.id),
        expiresIn: '7 days',
        issuer: this.issuer,
        audience: this.audience,
      },
    );

    //To invalidate the older valid token.
    await this.userService.updatePartial(user.id, { lastToken: token });

    return token;
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

  verifyTemporaryToken(token: string) {
    token = this.parseToken(token);
    try {
      const data = this.jwtService.verify(token, {
        audience: this.audience,
        issuer: 'forgotPassword',
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
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Email ou senha incorretos!');
    }
    if (!(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Email ou senha incorretos!');
    }
    return {
      user: user,
      logged: true,
      token: this.createToken(user),
      message: 'Login successful',
    };
  }

  async register(userData: AuthRegisterDTO) {
    const user = await this.userService.create(userData);
    return {
      user: user,
      logged: true,
      token: this.createToken(user),
      message: 'Registered successful',
    };
  }

  async forgotPassword({ email }: AuthRecoverDTO) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Email não encontrado!');
    }

    const tempToken = this.jwtService.sign(
      {
        id: user.id,
      },
      {
        subject: String(user.id),
        expiresIn: '15 minutes',
        issuer: 'forgotPassword',
        audience: this.audience,
      },
    );

    //Armazena o token em cache com tempo de expiração de 15 min
    await this.cacheService.set(String(user.id), tempToken, 900000);

    /* 

    Link único contendo nele 
    o tempToken como um parâmero de consulta na URL:

    */
    const link = `https://localhost:3000/auth/reset?token=${tempToken}`;

    //Enviar o e-mail...
    await this.mailerService.sendMail({
      subject: 'Recuperação de senha',
      to: 'vini@vini.com',
      template: 'forget',
      context: {
        name: user.username,
        link: link,
      },
    });

    return {
      message: 'E-mail enviado com sucesso! Verifique sua caixa de entrada.',
    };
  }

  async resetPassword({ token, password }: AuthResetDTO) {
    //Valida se token é valido e está dentro do prazo.
    const tokenPayload = this.verifyTemporaryToken(token);

    //Extrai id real do token
    const id = Number(tokenPayload.id);

    if (isNaN(id)) {
      throw new BadRequestException('Token payload inválido!');
    }

    const user = await this.userService.updatePartial(id, { password });

    //Remove o tempToken do cache.
    await this.cacheService.del(String(id));

    return this.createToken(user);
  }

  // async resetPasswordAllowed(token: string) {
  //   return token;
  // }
}
