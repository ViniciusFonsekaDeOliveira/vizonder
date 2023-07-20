import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
  forwardRef,
} from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UserIdCheckMiddleware } from '../middlewares/user-id-check.middleware';
import { FileModule } from '../file/file.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, FileModule, forwardRef(() => AuthModule)],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserIdCheckMiddleware).forRoutes(
      {
        path: 'user/:id',
        method: RequestMethod.GET,
      },
      {
        path: 'user/:id',
        method: RequestMethod.PATCH,
      },
      {
        path: 'user/:id',
        method: RequestMethod.PUT,
      },
      {
        path: 'user/:id',
        method: RequestMethod.DELETE,
      },
    );
  }
}
