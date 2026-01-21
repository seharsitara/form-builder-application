declare class AnswerDto {
    questionId: string;
    value: string;
}
export declare class CreateResponseDto {
    respondent?: string;
    email?: string;
    userId?: string;
    answers: AnswerDto[];
}
export {};
