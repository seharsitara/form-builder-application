import { CreateResponseDto } from './dto/create-response.dto';
import { ResponsesService } from './responses.service';
export declare class ResponsesController {
    private readonly responsesService;
    constructor(responsesService: ResponsesService);
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
    findAll(formId: string): Promise<{
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
