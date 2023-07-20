import { BadRequestException, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

export class UserIdCheckMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(UserIdCheckMiddleware.name, 'antes');
    if (isNaN(Number(req.params.id)) || Number(req.params.id) <= 0) {
      throw new BadRequestException(`ID inválido: ${req.params.id}`);
    }
    console.log(UserIdCheckMiddleware.name, 'depois');
    next();
  }
}
