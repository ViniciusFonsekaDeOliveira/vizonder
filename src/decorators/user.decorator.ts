import {
  createParamDecorator,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';

export const User = createParamDecorator(
  (filter: string, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    //usa o campo que o guard criou dentro do request.
    if (request.user) {
      if (filter) {
        //Se o decorador tem parametro, filtra os atributos de user
        return request.user[filter];
      } else {
        return request.user;
      }
    } else {
      throw new NotFoundException(
        'Usuário não encontrado no Request. Use o AuthGuard para obter o usuário.',
      );
    }
  },
);
