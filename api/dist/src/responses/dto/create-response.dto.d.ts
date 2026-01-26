declare class AnswerDto {
    questionId: string;
    value: string;
}
export declare class CreateResponseDto {
    respondent?: string;
    respondentEmail?: string;
    score?: number;
    maxScore?: number;
    userId?: string;
    answers: AnswerDto[];
}
export {};
