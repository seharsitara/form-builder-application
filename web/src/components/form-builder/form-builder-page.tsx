"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Plus, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FormDefinition, Question, QuestionOption, QuestionType } from "@/lib/types";
import { generateId } from "@/lib/utils";
import { saveForm, submitForm, exportResponsesToCsv, listSubmissions } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { useFormBuilder } from "@/context/form-builder-context";
import { Banner } from "./banner";
import { FormDetailsCard } from "./form-details-card";
import { QuestionCard, QUESTION_LABELS } from "./question-card";
import { PreviewCard } from "./preview-card";
import { ResponsesCard } from "./responses-card";
import { ShareCard } from "./share-card";

type SectionKey = "build" | "preview" | "responses";

const DRAFT_KEY = "form_builder_draft";

export type FormBuilderPageProps = {
  section?: SectionKey;
};

export function FormBuilderPage({ section = "build" }: FormBuilderPageProps) {
  const router = useRouter();
  const { form, setForm, answers, setAnswers, responses, setResponses, hasSubmitted, setHasSubmitted, totalMarks } = useFormBuilder();
  const [banner, setBanner] = useState<{ tone: "success" | "error" | "info"; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [session] = useState(() => getSession());

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as FormDefinition;
      setForm(parsed);
    } catch {
    }
  }, []);

  useEffect(() => {
    if (form.id === "form-seed") return;
    listSubmissions(form.id).then((subs) => setResponses(subs));
  }, [form.id, setResponses]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    } catch {
    }
  }, [form]);

  const setFormPartial = (patch: Partial<FormDefinition>) => setForm((prev) => ({ ...prev, ...patch }));

  const updateQuestion = (id: string, data: Partial<Question>) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => (q.id === id ? { ...q, ...data } : q)),
    }));
  };

  const addQuestion = (type: QuestionType) => {
    const withOptions = ["single_choice", "multi_choice", "dropdown"].includes(type);
    const newQuestion: Question = {
      id: generateId("q"),
      title: "New question",
      type,
      required: false,
      options: withOptions
        ? ["Option 1", "Option 2"].map((label, idx) => ({ id: generateId(`opt${idx}`), label }))
        : undefined,
      marks: 1,
      correctAnswers: [],
    };
    setForm((prev) => ({ ...prev, questions: [...prev.questions, newQuestion] }));
  };

  const removeQuestion = (id: string) => {
    setForm((prev) => ({ ...prev, questions: prev.questions.filter((q) => q.id !== id) }));
  };

  const moveQuestion = (id: string, direction: "up" | "down") => {
    setForm((prev) => {
      const idx = prev.questions.findIndex((q) => q.id === id);
      if (idx === -1) return prev;
      const swapWith = direction === "up" ? idx - 1 : idx + 1;
      if (swapWith < 0 || swapWith >= prev.questions.length) return prev;
      const next = [...prev.questions];
      [next[idx], next[swapWith]] = [next[swapWith], next[idx]];
      return { ...prev, questions: next };
    });
  };

  const addOption = (questionId: string) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => {
        if (q.id !== questionId) return q;
        const next: QuestionOption[] = [...(q.options ?? []), { id: generateId("opt"), label: `Option ${(q.options?.length ?? 0) + 1}` }];
        return { ...q, options: next };
      }),
    }));
  };

  const updateOption = (questionId: string, optionId: string, label: string) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => {
        if (q.id !== questionId || !q.options) return q;
        return { ...q, options: q.options.map((o) => (o.id === optionId ? { ...o, label } : o)) };
      }),
    }));
  };

  const removeOption = (questionId: string, optionId: string) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => {
        if (q.id !== questionId || !q.options) return q;
        return { ...q, options: q.options.filter((o) => o.id !== optionId) };
      }),
    }));
  };

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const validateRequired = (): string[] => {
    const missing: string[] = [];
    form.questions.forEach((q) => {
      if (!q.required) return;
      const value = answers[q.id];
      const isMissing =
        value === undefined ||
        (Array.isArray(value) && value.length === 0) ||
        (!Array.isArray(value) && String(value).trim() === "");
      if (isMissing) missing.push(q.title || "Untitled question");
    });
    return missing;
  };

  const handleSubmit = async () => {
    setBanner(null);
    if (form.settings.isClosed) {
      setBanner({ tone: "error", message: "Form is closed for responses." });
      return;
    }
    if (form.settings.singleSubmission && hasSubmitted) {
      setBanner({ tone: "error", message: "Only one submission is allowed." });
      return;
    }
    const missing = validateRequired();
    if (missing.length) {
      setBanner({ tone: "error", message: `Required: ${missing.join(", ")}` });
      return;
    }

    setSubmitting(true);
    try {
      const payload = form.questions.map((q) => ({
        questionId: q.id,
        value: answers[q.id] ?? (q.type === "multi_choice" ? [] : ""),
      }));
      const submission = await submitForm(form, payload, session ? {
        name: session.user.name,
        email: session.user.email,
        id: session.user.id,
      } : undefined);
      setResponses((prev) => [submission, ...prev]);
      setHasSubmitted(true);

      if (form.settings.quizMode && form.settings.showResult) {
        setBanner({
          tone: "success",
          message: `Submitted. Score: ${submission.score ?? 0}/${submission.maxScore ?? totalMarks}.`,
        });
      } else {
        setBanner({ tone: "success", message: "Submitted successfully." });
      }
    } catch {
      setBanner({ tone: "error", message: "Could not submit. Try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSave = async () => {
    setBanner(null);
    if (!session?.token) {
      setBanner({ tone: "error", message: "Sign in to save this form to the server." });
      return;
    }
    try {
      const saved = await saveForm(form);
      setForm(saved);
      setBanner({ tone: "success", message: "Form saved to the API." });
    } catch (error) {
      setBanner({ tone: "error", message: (error as Error).message || "Could not save form." });
    }
  };

  const goTo = (key: SectionKey) => {
    const path = key === "build" ? "/form-builder/build" : `/form-builder/${key}`;
    router.push(path);
  };

  const handleExport = () => {
    const csv = exportResponsesToCsv(responses);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${form.title || "form"}-responses.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleRefreshResponses = async () => {
    const subs = await listSubmissions(form.id);
    setResponses(subs);
  };

  const handleCopyLink = () => {
    if (form.id === "form-seed") {
      setBanner({ tone: "info", message: "Save the form first to generate a link." });
      return;
    }
    navigator.clipboard?.writeText(form.shareLink);
    setBanner({ tone: "info", message: "Share link copied." });
  };

  return (
    <div className="min-h-screen px-4 pb-16 pt-10 text-neutral-900 bg-neutral-100">
      <div className="mx-auto flex max-w-6xl gap-6">
        <aside className="sticky top-6 hidden w-64 shrink-0 flex-col gap-3 rounded-2xl border border-white/20 bg-neutral-900/90 p-4 shadow-xl backdrop-blur md:flex">
          <div className="mb-3 text-sm font-semibold text-white/90">Navigate</div>
          {[{ key: "build", label: "Build" }, { key: "preview", label: "Preview" }, { key: "responses", label: "Responses" }].map((item) => (
            <Button
              key={item.key}
              variant="ghost"
              className={`justify-start rounded-lg border border-white/10 text-white ${section === item.key ? "bg-neutral-900 hover:bg-neutral-900" : "bg-neutral-800 hover:bg-neutral-400"}`}
              onClick={() => goTo(item.key as SectionKey)}
            >
              {item.label}
            </Button>
          ))}
          <div className="mt-4 space-y-1 rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-white/80">
            <div>Quiz mode: {form.settings.quizMode ? "on" : "off"}</div>
            <div>Questions: {form.questions.length}</div>
            {form.settings.quizMode && <div>Total marks: {totalMarks}</div>}
          </div>
        </aside>

        <div className="flex-1 space-y-6">
          <header className="flex flex-col gap-4 rounded-2xl border border-white/20 bg-white/80 p-6 shadow-lg backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-neutral-500">Form Builder</p>
                <h1 className="text-3xl font-semibold">Create a new form</h1>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCopyLink} className="gap-2">
                  <Share2 size={16} /> Share link
                </Button>
                <Button onClick={handleSave} className="gap-2">
                  <CheckCircle2 size={16} /> Save draft
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-sm text-neutral-600">
              <Badge tone="info">Quiz mode {form.settings.quizMode ? "on" : "off"}</Badge>
              <Badge tone="neutral">Questions: {form.questions.length}</Badge>
              {form.settings.quizMode && <Badge tone="success">Total marks: {totalMarks}</Badge>}
              <Badge tone="neutral">Share: {form.shareLink}</Badge>
            </div>
            {banner && <Banner tone={banner.tone} message={banner.message} />}
          </header>

          {section === "build" && (
            <section className="space-y-4 rounded-2xl border border-white/30 bg-white/80 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Build form</h2>
                <Badge tone="neutral">Builder</Badge>
              </div>

              <FormDetailsCard form={form} onUpdate={setFormPartial} onCopyLink={handleCopyLink} />

              {form.questions.map((q, idx) => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  index={idx}
                  quizMode={form.settings.quizMode}
                  onUpdate={(patch) => updateQuestion(q.id, patch)}
                  onRemove={() => removeQuestion(q.id)}
                  onMove={(dir) => moveQuestion(q.id, dir)}
                  onAddOption={() => addOption(q.id)}
                  onUpdateOption={(optId, label) => updateOption(q.id, optId, label)}
                  onRemoveOption={(optId) => removeOption(q.id, optId)}
                />
              ))}

              <Card className="border-dashed border-neutral-300 pt-5">
                <CardContent className="flex flex-wrap gap-3 p-6">
                  {(Object.keys(QUESTION_LABELS) as QuestionType[]).map((type) => (
                    <Button key={type} variant="outline" className="gap-2" onClick={() => addQuestion(type)}>
                      <Plus size={14} /> {QUESTION_LABELS[type]}
                    </Button>
                  ))}
                </CardContent>
              </Card>

              <ShareCard shareLink={form.shareLink} onCopy={handleCopyLink} />
            </section>
          )}

          {section === "preview" && (
            <section className="space-y-4 rounded-2xl border border-white/30 bg-white/80 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Preview</h2>
                <Badge tone="info">Live</Badge>
              </div>
              <PreviewCard
                questions={form.questions}
                answers={answers}
                quizMode={form.settings.quizMode}
                submitting={submitting}
                onChangeAnswer={handleAnswerChange}
                onSubmit={handleSubmit}
                onClear={() => setAnswers({})}
              />
            </section>
          )}

          {section === "responses" && (
            <section className="space-y-4 rounded-2xl border border-white/30 bg-white/80 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Responses</h2>
                <Badge tone="success">Latest</Badge>
              </div>
              <ResponsesCard
                questions={form.questions}
                responses={responses}
                onExport={handleExport}
                onRefresh={handleRefreshResponses}
              />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
