"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { FormDefinition, Question, QuestionType, Submission } from "@/lib/types";
import { generateId } from "@/lib/utils";

type FormBuilderContextValue = {
  form: FormDefinition;
  setForm: React.Dispatch<React.SetStateAction<FormDefinition>>;
  answers: Record<string, string | string[]>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, string | string[]>>>;
  responses: Submission[];
  setResponses: React.Dispatch<React.SetStateAction<Submission[]>>;
  hasSubmitted: boolean;
  setHasSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
  totalMarks: number;
};

const FormBuilderContext = createContext<FormBuilderContextValue | null>(null);

const DRAFT_KEY = "form_builder_draft";
const ANSWERS_KEY = "form_builder_answers";
const RESPONSES_KEY = "form_builder_responses";

const seedForm = (initialTitle: string): FormDefinition => ({
  id: "form-seed",
  title: initialTitle,
  description: "Describe the purpose of this form.",
  shareLink: "https://forms.local/form-seed",
  settings: {
    quizMode: false,
    singleSubmission: false,
    isClosed: false,
    showResult: true,
  },
  questions: [
    {
      id: "q-seed",
      title: "Untitled question",
      description: "",
      type: "short_text",
      required: true,
      marks: 1,
    },
  ],
});

export function FormBuilderProvider({ initialTitle = "Untitled form", children }: { initialTitle?: string; children: React.ReactNode; }) {
  const [form, setForm] = useState<FormDefinition>(() => seedForm(initialTitle));
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [responses, setResponses] = useState<Submission[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Hydrate persisted state
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const draftRaw = window.localStorage.getItem(DRAFT_KEY);
      if (draftRaw) {
        const parsed = JSON.parse(draftRaw) as FormDefinition;
        setForm(parsed);
      }
      const ansRaw = window.localStorage.getItem(ANSWERS_KEY);
      if (ansRaw) {
        setAnswers(JSON.parse(ansRaw));
      }
      const respRaw = window.localStorage.getItem(RESPONSES_KEY);
      if (respRaw) {
        setResponses(JSON.parse(respRaw));
      }
    } catch {
    }
  }, []);

  // Ensure stable IDs after hydration/seed
  useEffect(() => {
    setForm((prev) => {
      if (prev.id !== "form-seed") return prev;
      const newId = generateId("form");
      const updatedQuestions = prev.questions.map((q) =>
        q.id === "q-seed" ? { ...q, id: generateId("q") } : q
      );
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      return {
        ...prev,
        id: newId,
        shareLink: origin ? `${origin}/forms/${newId}` : `https://forms.local/${newId}`,
        questions: updatedQuestions,
      };
    });
  }, []);

  // Persist form/answers/responses
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    } catch {}
  }, [form]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(ANSWERS_KEY, JSON.stringify(answers));
    } catch {}
  }, [answers]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(RESPONSES_KEY, JSON.stringify(responses));
    } catch {}
  }, [responses]);

  const totalMarks = useMemo(
    () => form.questions.reduce((sum, q) => sum + (q.marks ?? 0), 0),
    [form.questions]
  );

  const value: FormBuilderContextValue = {
    form,
    setForm,
    answers,
    setAnswers,
    responses,
    setResponses,
    hasSubmitted,
    setHasSubmitted,
    totalMarks,
  };

  return <FormBuilderContext.Provider value={value}>{children}</FormBuilderContext.Provider>;
}

export function useFormBuilder() {
  const ctx = useContext(FormBuilderContext);
  if (!ctx) throw new Error("useFormBuilder must be used within FormBuilderProvider");
  return ctx;
}