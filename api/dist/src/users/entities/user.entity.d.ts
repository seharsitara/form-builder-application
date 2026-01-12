export type UserRole = 'creator' | 'respondent' | 'admin';
export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    password?: string;
}
