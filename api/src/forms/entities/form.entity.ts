export type QuestionType =
  | 'short_text'
  | 'long_text'
  | 'single_choice'
  | 'multi_choice'
  | 'dropdown';

export interface FormQuestion {
  id: string;
  label: string;
  type: QuestionType;
  required: boolean;
  options?: string[];
}

export interface Form {
  id: string;
  title: string;
  description?: string;
  isQuiz: boolean;
  createdAt: Date;
  questions: FormQuestion[];
}
