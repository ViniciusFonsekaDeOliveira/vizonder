import { Injectable, OnModuleInit, INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  //Assim que esse modulo startar ele deve abrir conexão com o bd.
  async onModuleInit() {
    await this.$connect();
  }

  //Antes de a aplicação encerrar fechar conexão
  async enableShutdownHooks(app: INestApplication) {
    process.on('beforeExit', async () => {
      await app.close();
    });
  }
}
