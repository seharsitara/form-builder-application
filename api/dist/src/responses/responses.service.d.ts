import { PrismaService } from '../prisma/prisma.service';
import { CreateResponseDto } from './dto/create-response.dto';
export declare class ResponsesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(formId: string, dto: CreateResponseDto): Promise<{
        answers: {
            id: string;
            value: string;
            responseId: string;
            questionId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        respondent: string | null;
        respondentEmail: string | null;
        score: number | null;
        maxScore: number | null;
        userId: string | null;
        formId: string;
    }>;
    findByForm(formId: string): Promise<{
        answers: {
            value: string | string[];
            id: string;
            responseId: string;
            questionId: string;
        }[];
        id: string;
        createdAt: Date;
        respondent: string | null;
        respondentEmail: string | null;
        score: number | null;
        maxScore: number | null;
        userId: string | null;
        formId: string;
    }[]>;
}
