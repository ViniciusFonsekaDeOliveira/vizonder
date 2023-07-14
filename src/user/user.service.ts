import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './create.user.dto';
import { UpdateUserDto } from './update.user.dto';
import { PatchUserDto } from './patch.user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

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

  async create(userData: CreateUserDto): Promise<User> {
    //Criptografando a senha
    await this.encryptPassword(userData);

    try {
      return await this.prisma.user.create({
        data: userData,
      });
    } catch (error) {
      throw new BadRequestException(
        'Erro ao salvar usuário no Prisma\n',
        error,
      );
    }
  }

  async updatePartial(id: number, userData: PatchUserDto): Promise<User> {
    await this.exists(id);
    this.parseBirthToDateTime(userData);
    await this.encryptPassword(userData);

    return this.prisma.user.update({
      where: {
        id,
      },
      data: userData,
    });
  }

  async update(id: number, userData: UpdateUserDto): Promise<User> {
    await this.exists(id);
    this.parseBirthToDateTime(userData);
    await this.encryptPassword(userData);

    return this.prisma.user.update({
      where: { id },
      data: userData,
    });
  }

  async delete(id: number) {
    await this.exists(id);
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

  async encryptPassword(data: CreateUserDto | PatchUserDto | UpdateUserDto) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, await bcrypt.genSalt());
    }
  }
}
