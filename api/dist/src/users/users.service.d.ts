import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import type { User } from './entities/user.entity';
type SafeUser = Omit<User, 'password'>;
type AdminUser = SafeUser & {
    role: 'admin';
};
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private toAdmin;
    findAll(): Promise<AdminUser[]>;
    findByEmail(email: string): Promise<(User & {
        password: string;
    }) | null>;
    findOne(id: string): Promise<AdminUser | null>;
    create(dto: CreateUserDto & {
        password: string;
    }): Promise<AdminUser>;
}
export {};
