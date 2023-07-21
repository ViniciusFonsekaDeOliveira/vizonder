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
import * as bcrypt from 'bcrypt';
import { MailerService } from '@nestjs-modules/mailer/dist';

@Injectable()
export class AuthService {
  private issuer = 'login';
  private audience = 'users';

  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly mailerService: MailerService,
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
    return this.createToken(user);
  }

  async register(userData: AuthRegisterDTO) {
    const user = await this.userService.create(userData);
    return this.createToken(user);
  }

  async forgotPassword({ email }: AuthRecoverDTO) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Email não encontrado!');
    }

    const tempToken = this.jwtService.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        nickname: user.nickname,
      },
      {
        subject: String(user.id),
        expiresIn: '15 minutes',
        issuer: 'forgotPassword',
        audience: this.audience,
      },
    );

    //TO DO: Armazenar o token em cache com tempo de expiração de 15 min

    /* 

    TO DO: Enviar um email contendo um link único contendo nele 
    o tempToken como um paramero de consulta na URL:
    ("https://seusite.com/reset-password?token=SEU_TOKEN_AQUI")

    */
    //Enviar o e-mail...
    await this.mailerService.sendMail({
      subject: 'Recuperação de senha',
      to: 'vini@vini.com',
      template: 'forget',
      context: {
        name: user.username,
        //idealmente redireciona para um front-end com formulário para reset, mas como é uma api...
        token: tempToken,
      },
    });

    return true;
  }

  async resetPassword({ token, password }: AuthResetDTO) {
    //TO DO: validar se token é valido e está dentro do prazo.
    const tokenPayload = this.verifyTemporaryToken(token);

    //Extrai id real do token
    const id = Number(tokenPayload.id);

    if (isNaN(id)) {
      throw new BadRequestException('Token payload inválido!');
    }

    const user = await this.userService.updatePartial(id, { password });
    //TO DO: Remover o tempToken do cache ou do bd.
    return this.createToken(user);
  }

  /** GAP: Ao solicitar nova senha
   * o usuário de fato pode apenas logar no sistema com a nova senha.
   * Porém o token antigo, criado com a senha antiga,
   *  continua válido até que ele expire. Permitindo que o usuário
   * seja autorizado a entrar em rotas protegidas tanto com o novo
   * quanto com o velho token. Dessa forma mesmo que o usuário troque a senha
   * algum invasor que ainda detém o token antigo, consegue utilizar a conta
   * invadida até que o token antigo expire e novo login seja necessário
   *
   * Solução: revogar token antigo.
   *  */
}
