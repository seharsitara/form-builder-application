import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<({
        email: string;
        name: string;
        role: import("./entities/user.entity").UserRole;
        id: string;
    } & {
        role: "admin";
    })[]>;
    findOne(id: string): Promise<({
        email: string;
        name: string;
        role: import("./entities/user.entity").UserRole;
        id: string;
    } & {
        role: "admin";
    }) | null>;
}
