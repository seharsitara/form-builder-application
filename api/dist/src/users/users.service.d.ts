import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import type { User } from './entities/user.entity';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<Omit<User, 'password'>[]>;
    findByEmail(email: string): Promise<(User & {
        password: string;
    }) | null>;
    findOne(id: string): Promise<Omit<User, 'password'> | null>;
    create(dto: CreateUserDto & {
        password: string;
    }): Promise<Omit<User, 'password'>>;
}
