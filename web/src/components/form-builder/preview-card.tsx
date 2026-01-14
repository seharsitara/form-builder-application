import React from "react";
import { Eye, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Question } from "@/lib/types";

export type PreviewCardProps = {
  questions: Question[];
  answers: Record<string, string | string[]>;
  quizMode: boolean;
  submitting: boolean;
  onChangeAnswer: (id: string, val: string | string[]) => void;
  onSubmit: () => void;
  onClear: () => void;
};

export function PreviewCard({
  questions,
  answers,
  quizMode,
  submitting,
  onChangeAnswer,
  onSubmit,
  onClear,
}: PreviewCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Live preview</CardTitle>
          <Eye size={16} className="text-neutral-500" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          {questions.map((q) => (
            <div key={q.id} className="space-y-2">
              <div className="flex items-center gap-2">
                <p className="font-medium text-neutral-800">{q.title}</p>
                {q.required && <Badge tone="warning">Required</Badge>}
                {quizMode && !!(q.marks ?? 0) && <Badge tone="success">{q.marks} mark{(q.marks ?? 0) === 1 ? "" : "s"}</Badge>}
              </div>
              {q.description && <p className="text-sm text-neutral-600">{q.description}</p>}
              {renderInput(q, answers[q.id], onChangeAnswer)}
            </div>
          ))}
        </div>
        <div className="flex gap-3 pt-2">
          <Button className="gap-2" onClick={onSubmit} disabled={submitting}>
            <CheckCircle2 size={16} /> {submitting ? "Submitting..." : "Submit"}
          </Button>
          <Button variant="outline" onClick={onClear} disabled={submitting}>
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
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

export { renderInput };
