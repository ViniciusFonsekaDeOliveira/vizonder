import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext) {
    //Acessar o request para manipular ele no controller
    const request = context.switchToHttp().getRequest();
    const { authorization } = request.headers;

    try {
      const data = this.authService.verifyToken(authorization);

      //cria um atributo tokenPayload no request passando os dados do token
      request.tokenPayload = data;
      //cria um atributo user no request passando os dados do usuário do banco
      request.user = await this.userService.findById(data.id);

      //Verifica se o token autorizado é o token atual do usuário .
      if (
        request.user.lastToken !== this.authService.parseToken(authorization)
      ) {
        /**
         * Isso adiciona uma camada extra de segurança
         * para evitar que tokens antigos sejam usados
         * indevidamente após o usuário redefinir a senha
         * ou realizar outras ações que gerem novos tokens.
         */
        throw new UnauthorizedException('Token inválido ou expirado');
      }

      return true;
    } catch (e) {
      return false;
    }
  }
}
