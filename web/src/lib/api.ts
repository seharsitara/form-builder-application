import { AnswerPayload, FormDefinition, Submission } from "./types";
import { generateId } from "./utils";

const STORAGE_KEY = "form_builder_forms";
const SUBMISSION_KEY = "form_builder_submissions";

// Placeholder API layer for demo; replace with real HTTP calls when backend is ready.
export async function saveForm(definition: FormDefinition): Promise<FormDefinition> {
  await delay();
  persistForm(definition);
  return definition;
}

export async function loadForm(id: string): Promise<FormDefinition | null> {
  await delay();
  return readForm(id);
}

export async function submitForm(
  definition: FormDefinition,
  answers: AnswerPayload[],
  respondent?: { name?: string; email?: string; id?: string }
): Promise<Submission> {
  await delay();

  const maxScore = definition.settings.quizMode
    ? definition.questions.reduce((sum, q) => sum + (q.marks ?? 0), 0)
    : undefined;

  const score = definition.settings.quizMode ? grade(definition, answers) : undefined;

  const submission: Submission = {
    id: generateId("submission"),
    submittedAt: new Date().toISOString(),
    respondentName: respondent?.name,
    respondentEmail: respondent?.email,
    respondentId: respondent?.id,
    answers,
    score,
    maxScore,
  };

  persistSubmission(definition.id, submission);
  return submission;
}

export async function listSubmissions(formId: string): Promise<Submission[]> {
  await delay();
  return readSubmissions(formId);
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

function delay(ms = 250) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function persistForm(def: FormDefinition) {
  if (typeof window === "undefined") return;
  const existing = readStore();
  const next = { ...existing, [def.id]: def };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

function readForm(id: string): FormDefinition | null {
  const store = readStore();
  return store[id] ?? null;
}

function readStore(): Record<string, FormDefinition> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, FormDefinition>) : {};
  } catch {
    return {};
  }
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
