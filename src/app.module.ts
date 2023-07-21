import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { FileModule } from './file/file.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';

@Module({
  imports: [
    MailerModule.forRoot({
      //Usar object ao inves da string, permite setar corretamente a porta.
      transport: {
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: 'dillan50@ethereal.email',
          pass: '7vh7s81qnb9p8Jg9eD',
        },
      },
      defaults: {
        from: '"Vini" <dillan50@ethereal.email>',
      },
      template: {
        dir: __dirname + '/templates',
        adapter: new PugAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    ConfigModule.forRoot(),
    ThrottlerModule.forRoot({
      ignoreUserAgents: [/googlebot/gi],
      ttl: 60,
      limit: 100,
    }),
    UserModule,
    PrismaModule,
    AuthModule,
    FileModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard, //Habilita globalmente.
    },
  ],
  exports: [],
})
export class AppModule {}
