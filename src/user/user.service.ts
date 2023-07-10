import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './create.user.dto';
import { UpdateUserDto } from './update.user.dto';
import { PatchUserDto } from './patch.user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UserServiceCreationException } from '../exceptions/UserServiceCreationException';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<object> {
    return this.prisma.user.findMany();
  }

  async show(id: number): Promise<object> {
    await this.exists(id);
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async save({
    username,
    nickname,
    email,
    password,
  }: CreateUserDto): Promise<object> {
    try {
      return await this.prisma.user.create({
        data: {
          username,
          nickname,
          email,
          password,
        },
      });
    } catch (error) {
      console.error('Erro ao executar operação no Prisma:', error);
      throw new UserServiceCreationException('Erro ao salvar usuário');
    }
  }

  async updatePartial(id: number, userData: PatchUserDto): Promise<object> {
    return this.prisma.user.update({
      where: {
        id,
      },
      data: userData,
    });
  }

  //Informações não passadas devem ser zeradas.
  async update(id: number, userData: UpdateUserDto): Promise<object> {
    return this.prisma.user.update({
      where: { id },
      data: userData,
    });
  }

  async delete(id: number) {
    console.log(`Deleting user #${id} from database.`);
    await this.prisma.user.delete({
      where: { id },
    });
  }

  async exists(id: number) {
    if (!(await this.prisma.user.count({ where: { id } }))) {
      throw new NotFoundException(`O usuário #${id} não existe.`);
    }
  }
}
