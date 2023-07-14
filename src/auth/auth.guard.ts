import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';
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

      return true;
    } catch (e) {
      return false;
    }
  }
}
