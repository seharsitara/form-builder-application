"use client";

import { useEffect, useMemo, useState } from "react";
import { notFound, useParams } from "next/navigation";
import { getSession } from "@/lib/auth";
import { FormDefinition, Question, Submission } from "@/lib/types";
import { loadForm, submitForm } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";

export default function PublicFormPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [form, setForm] = useState<FormDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [respondent, setRespondent] = useState<{ name: string; email: string; id?: string }>(() => {
    const session = getSession();
    return {
      name: session?.user.name ?? "",
      email: session?.user.email ?? "",
      id: session?.user.id,
    };
  });
  const [banner, setBanner] = useState<{ tone: "success" | "error" | "info"; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!id) return;
      const result = await loadForm(id);
      if (!active) return;
      setForm(result);
      setLoading(false);
    };
    load();
    return () => {
      active = false;
    };
  }, [id]);

  const totalMarks = useMemo(
    () => (form ? form.questions.reduce((sum, q) => sum + (q.marks ?? 0), 0) : 0),
    [form]
  );

  if (!id) {
    notFound();
  }

  if (loading) {
    return <p className="p-6 text-sm text-neutral-600">Loading form…</p>;
  }

  if (!form) {
    return <p className="p-6 text-sm text-neutral-600">Form not found. Ensure it was saved from the builder.</p>;
  }

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
      const submission: Submission = await submitForm(form, payload, respondent);
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

  return (
    <div className="min-h-screen px-4 pb-16 pt-10 text-neutral-900">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="flex flex-col gap-3 rounded-2xl border border-white/20 bg-white/80 p-6 shadow-lg backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-neutral-500">Shared form</p>
              <h1 className="text-3xl font-semibold">{form.title}</h1>
            </div>
            {form.settings.quizMode && <Badge tone="success">Total marks: {totalMarks}</Badge>}
          </div>
          <p className="text-sm text-neutral-600">{form.description}</p>
          {banner && (
            <div
              className={`rounded-md border px-4 py-3 text-sm ${
                banner.tone === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : banner.tone === "error"
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-blue-200 bg-blue-50 text-blue-700"
              }`}
            >
              {banner.message}
            </div>
          )}
        </header>

        <Card>
          <CardContent className="space-y-4 p-5">
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-neutral-800">Your details</p>
                <p className="text-xs text-neutral-600">Shared with the form owner to help identify your response.</p>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-700" htmlFor="respondent-name">
                    Name
                  </label>
                  <Input
                    id="respondent-name"
                    placeholder="Your name"
                    value={respondent.name}
                    onChange={(e) => setRespondent((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-700" htmlFor="respondent-email">
                    Email
                  </label>
                  <Input
                    id="respondent-email"
                    placeholder="you@example.com"
                    type="email"
                    value={respondent.email}
                    onChange={(e) => setRespondent((prev) => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {form.questions.map((q) => (
              <div key={q.id} className="space-y-2">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-neutral-800">{q.title}</p>
                  {q.required && <Badge tone="warning">Required</Badge>}
                  {form.settings.quizMode && !!(q.marks ?? 0) && (
                    <Badge tone="success">{q.marks} mark{(q.marks ?? 0) === 1 ? "" : "s"}</Badge>
                  )}
                </div>
                {q.description && <p className="text-sm text-neutral-600">{q.description}</p>}
                {renderInput(q, answers[q.id], handleAnswerChange)}
              </div>
            ))}
            <div className="flex gap-3 pt-2">
              <Button className="gap-2" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Submitting..." : "Submit"}
              </Button>
              <Button variant="outline" onClick={() => setAnswers({})} disabled={submitting}>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function renderInput(
  q: Question,
  value: string | string[] | undefined,
  onChange: (id: string, val: string | string[]) => void
) {
  const common = { placeholder: "Your answer" };

  if (q.type === "short_text") {
    return (
      <Input
        {...common}
        value={(value as string) ?? ""}
        onChange={(e) => onChange(q.id, e.target.value)}
      />
    );
  }

  if (q.type === "long_text") {
    return (
      <Textarea
        rows={4}
        {...common}
        value={(value as string) ?? ""}
        onChange={(e) => onChange(q.id, e.target.value)}
      />
    );
  }

  if (q.type === "dropdown") {
    return (
      <Select value={(value as string) ?? ""} onChange={(e) => onChange(q.id, e.target.value)}>
        <option value="">Select an option</option>
        {(q.options ?? []).map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </Select>
    );
  }

  if (q.type === "single_choice") {
    return (
      <div className="space-y-2">
        {(q.options ?? []).map((opt) => (
          <label key={opt.id} className="flex items-center gap-2 text-sm text-neutral-800">
            <input
              type="radio"
              name={q.id}
              value={opt.id}
              checked={value === opt.id}
              onChange={(e) => onChange(q.id, e.target.value)}
              className="h-4 w-4"
            />
            {opt.label}
          </label>
        ))}
      </div>
    );
  }

  if (q.type === "multi_choice") {
    const selected = new Set(Array.isArray(value) ? value : []);
    return (
      <div className="space-y-2">
        {(q.options ?? []).map((opt) => (
          <label key={opt.id} className="flex items-center gap-2 text-sm text-neutral-800">
            <input
              type="checkbox"
              value={opt.id}
              checked={selected.has(opt.id)}
              onChange={(e) => {
                const next = new Set(selected);
                if (e.target.checked) {
                  next.add(opt.id);
                } else {
                  next.delete(opt.id);
                }
                onChange(q.id, Array.from(next));
              }}
              className="h-4 w-4"
            />
            {opt.label}
          </label>
        ))}
      </div>
    );
  }

  return null;
}
