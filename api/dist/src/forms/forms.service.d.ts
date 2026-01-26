import { CreateFormDto } from './dto/create-form.dto';
import { PrismaService } from '../prisma/prisma.service';
export declare class FormsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateFormDto, creatorId: string): Promise<{
        questions: {
            id: string;
            label: string;
            type: import("@prisma/client").$Enums.QuestionType;
            required: boolean;
            options: string[];
            correctAnswers: string[];
            order: number;
            formId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        title: string;
        description: string | null;
        isQuiz: boolean;
        creatorId: string;
    }>;
    findAll(): Promise<({
        questions: {
            id: string;
            label: string;
            type: import("@prisma/client").$Enums.QuestionType;
            required: boolean;
            options: string[];
            correctAnswers: string[];
            order: number;
            formId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        title: string;
        description: string | null;
        isQuiz: boolean;
        creatorId: string;
    })[]>;
    findOne(id: string): Promise<{
        questions: {
            id: string;
            label: string;
            type: import("@prisma/client").$Enums.QuestionType;
            required: boolean;
            options: string[];
            correctAnswers: string[];
            order: number;
            formId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        title: string;
        description: string | null;
        isQuiz: boolean;
        creatorId: string;
    }>;
}
