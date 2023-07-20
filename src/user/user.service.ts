import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './create.user.dto';
import { UpdateUserDto } from './update.user.dto';
import { PatchUserDto } from './patch.user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { FileService } from '../file/file.service';
import { join } from 'path';
import * as fs from 'node:fs';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileService: FileService,
  ) {}

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
    await this.existsNickname(userData.nickname);
    await this.existsEmail(userData.email);
    await this.encryptPassword(userData);
    this.parseBirthToDateTime(userData);
    try {
      return await this.prisma.user.create({
        data: userData,
      });
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Erro ao salvar usuário no Prisma');
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

  async existsNickname(nickname: string) {
    if (await this.prisma.user.count({ where: { nickname } })) {
      throw new ConflictException(`O usuário ${nickname} já existe.`);
    }
    return false;
  }

  async existsEmail(email: string) {
    if (await this.prisma.user.count({ where: { email } })) {
      throw new ConflictException(`O endereço ${email} já está cadastrado.`);
    }
    return false;
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

  async uploadPhoto(user: User, photo: Express.Multer.File): Promise<boolean> {
    const mainPath = join(
      __dirname,
      '..',
      '..',
      'storage',
      'profile-pic',
      `${user.id}`,
    );

    if (!fs.existsSync(mainPath)) {
      fs.mkdirSync(mainPath, { recursive: true });
    }

    const filePath = join(mainPath, `pic-${user.id}.png`);

    try {
      this.fileService.upload(photo, filePath);
    } catch (e) {
      throw new BadRequestException(e);
    }

    await this.updatePartial(user.id, { photo: filePath });

    return true;
  }

  async uploadPhotos(user: User, photos: Express.Multer.File[]) {
    const mainPath = join(
      __dirname,
      '..',
      '..',
      'storage',
      'profile-pics',
      `${user.id}`,
    );

    if (!fs.existsSync(mainPath)) {
      fs.mkdirSync(mainPath, { recursive: true });
    }

    const filePaths = photos.map((photo) => {
      const uniqueName = `${user.id}_${photo.originalname}`;
      const filePath = join(mainPath, uniqueName);
      try {
        this.fileService.upload(photo, filePath);
        return filePath;
      } catch (e) {
        throw new BadRequestException(e);
      }
    });

    const jsonFilePaths = JSON.stringify(filePaths);
    await this.updatePartial(user.id, { photos: jsonFilePaths });

    return true;
  }
}
