import { Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';
import type { User } from '../users/entities/user.entity';
export interface JwtPayload {
    sub: string;
    email: string;
    role: User['role'];
}
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly usersService;
    constructor(usersService: UsersService);
    validate(payload: JwtPayload): Promise<{
        id: string;
        email: string;
        role: "admin";
    }>;
}
export {};
