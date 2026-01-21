import { CreateResponseDto } from './dto/create-response.dto';
import { ResponsesService } from './responses.service';
export declare class ResponsesController {
    private readonly responsesService;
    constructor(responsesService: ResponsesService);
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
    findAll(formId: string): Promise<{
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
