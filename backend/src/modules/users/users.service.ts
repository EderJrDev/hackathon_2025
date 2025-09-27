import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/common/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/User.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { username, password, role } = createUserDto;

    const user = await this.prisma.user.findUnique({ where: { username } });

    if (user) throw new ConflictException('User already exists');

    const hashed = await bcrypt.hash(password, 10);

    return this.prisma.user.create({
      data: {
        username,
        password: hashed,
        role,
      },
      select: { id: true, username: true, role: true },
    });
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      select: { id: true, username: true, role: true },
    });

    return users;
  }

  async findOne(
    id: string,
  ): Promise<{ id: string; username: string; role: string } | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, username: true, role: true },
    });

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const data = { ...updateUserDto };

    if (updateUserDto.password) {
      data.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data: data,
      select: { id: true, username: true, role: true },
    });
  }

  async delete(id: string): Promise<User> {
    return this.prisma.user.delete({ where: { id } });
  }
}
