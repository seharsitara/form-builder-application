import type { QuestionType } from '../entities/form.entity';
declare class QuestionDto {
    label: string;
    type: QuestionType;
    required: boolean;
    options?: string[];
}
export declare class CreateFormDto {
    title: string;
    description?: string;
    isQuiz?: boolean;
    questions?: QuestionDto[];
}
export {};
