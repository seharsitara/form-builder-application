import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<Omit<import("./entities/user.entity").User, "password">[]>;
    findOne(id: string): Promise<Omit<import("./entities/user.entity").User, "password"> | null>;
}
