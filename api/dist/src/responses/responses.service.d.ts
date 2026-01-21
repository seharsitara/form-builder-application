import { PrismaService } from '../prisma/prisma.service';
import { CreateResponseDto } from './dto/create-response.dto';
export declare class ResponsesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(formId: string, dto: CreateResponseDto): Promise<{
        answers: {
            id: string;
            value: string;
            questionId: string;
            responseId: string;
        }[];
    } & {
        id: string;
        respondent: string | null;
        createdAt: Date;
        formId: string;
        userId: string | null;
    }>;
    findByForm(formId: string): Promise<{
        answers: {
            value: string | string[];
            id: string;
            questionId: string;
            responseId: string;
        }[];
        id: string;
        respondent: string | null;
        createdAt: Date;
        formId: string;
        userId: string | null;
    }[]>;
}
