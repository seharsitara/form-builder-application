import React from "react";
import {
  GripVertical,
  MoveDown,
  MoveUp,
  Plus,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Question, QuestionType } from "@/lib/types";

const QUESTION_LABELS: Record<QuestionType, string> = {
  short_text: "Short text",
  long_text: "Long text",
  single_choice: "Multiple choice",
  multi_choice: "Checkboxes",
  dropdown: "Dropdown",
};

export type QuestionCardProps = {
  question: Question;
  index: number;
  quizMode: boolean;
  onUpdate: (patch: Partial<Question>) => void;
  onRemove: () => void;
  onMove: (direction: "up" | "down") => void;
  onAddOption: () => void;
  onUpdateOption: (optionId: string, label: string) => void;
  onRemoveOption: (optionId: string) => void;
};

export function QuestionCard({
  question,
  index,
  quizMode,
  onUpdate,
  onRemove,
  onMove,
  onAddOption,
  onUpdateOption,
  onRemoveOption,
}: QuestionCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <GripVertical className="text-neutral-300" size={16} /> Question {index + 1}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => onMove("up")} aria-label="Move up">
              <MoveUp size={16} />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onMove("down")} aria-label="Move down">
              <MoveDown size={16} />
            </Button>
            <Button variant="ghost" size="icon" onClick={onRemove} aria-label="Delete">
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input
          value={question.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Question title"
        />
        <Textarea
          value={question.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Optional description"
          rows={2}
        />
        <div className="grid gap-3 pt-2 sm:grid-cols-2">
          <Select
            value={question.type}
            onChange={(e) => onUpdate({ type: e.target.value as QuestionType })}
          >
            {Object.entries(QUESTION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <div className="flex items-center justify-between rounded-md border border-neutral-200 px-3 py-2 text-sm">
            <span>Required</span>
            <Switch checked={Boolean(question.required)} onCheckedChange={(required) => onUpdate({ required })} />
          </div>
          {quizMode && (
            <Input
              type="number"
              min={0}
              value={question.marks ?? 0}
              onChange={(e) => onUpdate({ marks: Number(e.target.value) })}
              placeholder="Marks"
            />
          )}
        </div>

        <div className="" />

        {question.type === "short_text" || question.type === "long_text" ? (
          quizMode && (
            <Input
              value={(question.correctAnswers?.[0] as string) || ""}
              onChange={(e) => onUpdate({ correctAnswers: [e.target.value] })}
              placeholder="Correct answer (optional)"
            />
          )
        ) : (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-neutral-700">Options</p>
              <Button variant="ghost" size="sm" className="gap-2" onClick={onAddOption}>
                <Plus size={14} /> Add option
              </Button>
            </div>
            <div className="space-y-2">
              {(question.options ?? []).map((opt) => (
                <div key={opt.id} className="flex items-center gap-2">
                  <Input value={opt.label} onChange={(e) => onUpdateOption(opt.id, e.target.value)} />
                  <Button variant="ghost" size="icon" onClick={() => onRemoveOption(opt.id)} aria-label="Remove option">
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
            </div>
            {quizMode && (
              <div className="space-y-1">
                <p className="text-sm text-neutral-600">Select correct answers</p>
                <div className="flex flex-wrap gap-2">
                  {(question.options ?? []).map((opt) => {
                    const checked = question.correctAnswers?.includes(opt.id) ?? false;
                    return (
                      <Button
                        key={opt.id}
                        variant={checked ? "primary" : "outline"}
                        size="sm"
                        onClick={() => {
                          const next = new Set(question.correctAnswers ?? []);
                          if (checked) {
                            next.delete(opt.id);
                          } else {
                            next.add(opt.id);
                          }
                          onUpdate({ correctAnswers: Array.from(next) });
                        }}
                      >
                        {opt.label}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { QUESTION_LABELS };
