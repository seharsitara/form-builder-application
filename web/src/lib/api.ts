import { getSession } from "./auth";
import { AnswerPayload, FormDefinition, Question, Submission } from "./types";
import { generateId } from "./utils";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000").replace(/\/$/, "");
const SUBMISSION_KEY = "form_builder_submissions";

type ApiQuestion = {
  id: string;
  label: string;
  type: Question["type"];
  required: boolean;
  options?: string[];
  correctAnswers?: string[];
};

type ApiForm = {
  id: string;
  title: string;
  description?: string | null;
  isQuiz: boolean;
  questions: ApiQuestion[];
};

export async function saveForm(definition: FormDefinition): Promise<FormDefinition> {
  const session = getSession();
  if (!session?.token) {
    throw new Error("Please sign in to save forms.");
  }

  const payload = toCreatePayload(definition);
  const res = await fetch(`${API_BASE}/forms`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await handleResponse<ApiForm>(res);
  const mapped = mapApiForm(data);
  return { ...mapped, settings: definition.settings };
}

export async function loadForm(id: string): Promise<FormDefinition | null> {
  const res = await fetch(`${API_BASE}/forms/${id}`);
  if (res.status === 404) return null;
  const data = await handleResponse<ApiForm>(res);
  return mapApiForm(data);
}


export async function submitForm(
  definition: FormDefinition,
  answers: AnswerPayload[],
  respondent?: { name?: string; email?: string; id?: string }
): Promise<Submission> {
  const payload = {
    respondent: respondent?.name,
    respondentEmail: respondent?.email,
    userId: respondent?.id,
    score: definition.settings.quizMode ? grade(definition, answers) : undefined,
    maxScore: definition.settings.quizMode
      ? definition.questions.reduce((sum, q) => sum + (q.marks ?? 0), 0)
      : undefined,
    answers: answers.map((a) => ({
      questionId: a.questionId,
      value: Array.isArray(a.value) ? JSON.stringify(a.value) : String(a.value),
    })),
  };

  const res = await fetch(`${API_BASE}/forms/${definition.id}/responses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await handleResponse<{
    id: string;
    createdAt: string;
    respondent?: string | null;
    respondentEmail?: string | null;
    userId?: string | null;
    score?: number | null;
    maxScore?: number | null;
    answers: { id: string; questionId: string; value: string | string[] }[];
  }>(res);

  const score = data.score ?? (definition.settings.quizMode ? grade(definition, answers) : undefined);
  const maxScore =
    data.maxScore ??
    (definition.settings.quizMode
      ? definition.questions.reduce((sum, q) => sum + (q.marks ?? 0), 0)
      : undefined);

  const submission: Submission = {
    id: data.id,
    submittedAt: data.createdAt,
    respondentName: data.respondent ?? respondent?.name,
    respondentEmail: data.respondentEmail ?? respondent?.email,
    respondentId: data.userId ?? respondent?.id,
    answers: data.answers.map((a) => ({
      questionId: a.questionId,
      value: typeof a.value === "string" ? tryParseValue(a.value) : a.value,
    })),
    score,
    maxScore,
  };

  persistSubmission(definition.id, submission);
  return submission;
}

export async function listSubmissions(formId: string): Promise<Submission[]> {
  const res = await fetch(`${API_BASE}/forms/${formId}/responses`);
  if (!res.ok) {
    return readSubmissions(formId);
  }
  const data = await res.json();
  return (data as any[]).map((r) => ({
    id: r.id,
    submittedAt: r.createdAt,
    respondentName: r.respondent ?? "",
    respondentEmail: r.respondentEmail ?? "",
    respondentId: r.userId ?? undefined,
    answers: (r.answers ?? []).map((a: any) => ({
      questionId: a.questionId,
      value: typeof a.value === "string" ? tryParseValue(a.value) : a.value,
    })),
    score: r.score ?? undefined,
    maxScore: r.maxScore ?? undefined,
  }));
}

export function exportResponsesToCsv(submissions: Submission[]): string {
  const header = [
    "Submission ID",
    "Submitted At",
    "Name",
    "Email",
    "Answers",
    "Score",
    "Max Score",
  ];
  const rows = submissions.map((s) => [
    s.id,
    s.submittedAt,
    s.respondentName ?? "",
    s.respondentEmail ?? "",
    JSON.stringify(s.answers),
    s.score ?? "",
    s.maxScore ?? "",
  ]);

  return [header, ...rows]
    .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
}

function tryParseValue(raw: string): string | string[] {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as string[];
  } catch {
    // ignore
  }
  return raw;
}

function mapApiForm(apiForm: ApiForm): FormDefinition {
  return {
    id: apiForm.id,
    title: apiForm.title,
    description: apiForm.description ?? "",
    shareLink: buildShareLink(apiForm.id),
    settings: {
      quizMode: apiForm.isQuiz,
      singleSubmission: false,
      isClosed: false,
      showResult: true,
    },
    questions: apiForm.questions.map((q) => ({
      id: q.id,
      title: q.label,
      description: "",
      type: q.type,
      required: q.required,
      options: (q.options ?? []).map((opt) => ({ id: opt, label: opt })),
      correctAnswers: q.correctAnswers ?? [],
      marks: apiForm.isQuiz ? 1 : undefined,
    })),
  };
}

function toCreatePayload(definition: FormDefinition) {
  return {
    title: definition.title,
    description: definition.description,
    isQuiz: definition.settings.quizMode,
    questions: definition.questions.map((q, idx) => ({
      label: q.title,
      type: q.type,
      required: Boolean(q.required),
      options: q.options?.map((opt) => opt.label) ?? [],
      correctAnswers: q.correctAnswers ?? [],
      order: idx,
    })),
  };
}

function buildShareLink(id: string) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return origin ? `${origin}/forms/${id}` : `https://forms.local/${id}`;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const message = await extractError(res);
    throw new Error(message || "Request failed");
  }
  return res.json() as Promise<T>;
}

async function extractError(res: Response) {
  try {
    const data = await res.json();
    if (typeof data?.message === "string") return data.message;
    if (Array.isArray(data?.message)) return data.message.join(", ");
  } catch {
    // ignore parse errors
  }
  return res.statusText;
}

function grade(definition: FormDefinition, answers: AnswerPayload[]): number {
  return answers.reduce((total, answer) => {
    const question = definition.questions.find((q) => q.id === answer.questionId);
    if (!question || !question.correctAnswers?.length || !question.marks) return total;

    if (question.type === "short_text" || question.type === "long_text") {
      const value = String(answer.value).trim().toLowerCase();
      const match = question.correctAnswers.some((c) => c.toLowerCase().trim() === value);
      return total + (match ? question.marks : 0);
    }

    const answerValues = Array.isArray(answer.value) ? answer.value : [String(answer.value)];
    const correct = question.correctAnswers.slice().sort().join("|");
    const received = answerValues.slice().sort().join("|");
    return total + (correct === received ? question.marks : 0);
  }, 0);
}

function persistSubmission(formId: string, submission: Submission) {
  if (typeof window === "undefined") return;
  const store = readSubmissionStore();
  const list = store[formId] ?? [];
  store[formId] = [submission, ...list];
  window.localStorage.setItem(SUBMISSION_KEY, JSON.stringify(store));
}

function readSubmissions(formId: string): Submission[] {
  const store = readSubmissionStore();
  return store[formId] ?? [];
}

function readSubmissionStore(): Record<string, Submission[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(SUBMISSION_KEY);
    return raw ? (JSON.parse(raw) as Record<string, Submission[]>) : {};
  } catch {
    return {};
  }
}
