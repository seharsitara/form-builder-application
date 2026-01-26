export type QuestionType =
  | "short_text"
  | "long_text"
  | "single_choice"
  | "multi_choice"
  | "dropdown";

export type UserRole = "admin";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type QuestionOption = {
  id: string;
  label: string;
};

export type Question = {
  id: string;
  title: string;
  description?: string;
  type: QuestionType;
  required?: boolean;
  options?: QuestionOption[];
  correctAnswers?: string[]; 
  marks?: number;
};

export type FormSettings = {
  quizMode: boolean;
  singleSubmission: boolean;
  isClosed: boolean;
  showResult: boolean;
};

export type FormDefinition = {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  settings: FormSettings;
  shareLink: string;
};

export type AnswerPayload = {
  questionId: string;
  value: string | string[];
};

export type Submission = {
  id: string;
  submittedAt: string;
  respondentName?: string;
  respondentEmail?: string;
  respondentId?: string;
  answers: AnswerPayload[];
  score?: number;
  maxScore?: number;
};
