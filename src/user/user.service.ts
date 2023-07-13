import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './create.user.dto';
import { UpdateUserDto } from './update.user.dto';
import { PatchUserDto } from './patch.user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<object> {
    return this.prisma.user.findMany();
  }

  async findById(id: number): Promise<User> {
    await this.exists(id);
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmailAndPassword(email: string, password: string): Promise<User> {
    return this.prisma.user.findFirst({
      where: { email, password },
    });
  }

  async findByEmail(email: string): Promise<User> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async create({
    username,
    nickname,
    email,
    password,
  }: CreateUserDto): Promise<User> {
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
      throw new ConflictException('Erro ao salvar usuário');
    }
  }

  async updatePartial(id: number, userData: PatchUserDto): Promise<User> {
    this.parseBirthToDateTime(userData);
    return this.prisma.user.update({
      where: {
        id,
      },
      data: userData,
    });
  }

  async update(id: number, userData: UpdateUserDto): Promise<User> {
    this.parseBirthToDateTime(userData);
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
    return true;
  }

  parseBirthToDateTime(
    data: UpdateUserDto | PatchUserDto,
  ): UpdateUserDto | PatchUserDto {
    if (data.birth) {
      if (!(data.birth instanceof Date)) {
        data.birth = new Date(data.birth);
      }
    }
    return data;
  }
}
