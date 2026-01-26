import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import type { User } from './entities/user.entity';

type SafeUser = Omit<User, 'password'>;
type AdminUser = SafeUser & { role: 'admin' };
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private toAdmin(user: { id: string; email: string; name: string; role: unknown; createdAt: Date; updatedAt: Date }): AdminUser {
    return { ...user, role: 'admin' } as AdminUser;
  }

  async findAll(): Promise<AdminUser[]> {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return users.map((u) => this.toAdmin(u));
  }

  async findByEmail(email: string): Promise<(User & { password: string }) | null> {
    return this.prisma.user.findUnique({ where: { email } }) as Promise<
      (User & { password: string }) | null
    >;
  }

  async findOne(id: string): Promise<AdminUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return user ? this.toAdmin(user) : null;
  }

  async create(dto: CreateUserDto & { password: string }): Promise<AdminUser> {
    const created = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        role: dto.role ?? 'admin',
        password: dto.password,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return this.toAdmin(created);
  }
}
