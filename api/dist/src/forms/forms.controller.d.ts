import { CreateFormDto } from './dto/create-form.dto';
import { FormsService } from './forms.service';
export declare class FormsController {
    private readonly formsService;
    constructor(formsService: FormsService);
    create(body: CreateFormDto, req: any): Promise<{
        questions: {
            id: string;
            label: string;
            type: import("@prisma/client").$Enums.QuestionType;
            required: boolean;
            options: string[];
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
