import React from "react";
import { Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Submission, Question } from "@/lib/types";

export type ResponsesCardProps = {
  responses: Submission[];
  questions: Question[];
  onExport: () => void;
  onRefresh?: () => void;
};

export function ResponsesCard({ responses, questions, onExport, onRefresh }: ResponsesCardProps) {
  const questionMap = new Map(questions.map((q) => [q.id, q.title]));

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Responses</CardTitle>
          <div className="flex gap-2">
            {onRefresh && (
              <Button variant="ghost" size="sm" className="text-xs" onClick={onRefresh}>
                Refresh
              </Button>
            )}
            <Button variant="outline" size="sm" className="gap-2" onClick={onExport} disabled={!responses.length}>
              <Download size={14} /> Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {!responses.length && <p className="text-sm text-neutral-500">No responses yet.</p>}
        {responses.length > 0 && (
          <div className="space-y-3">
            {responses.map((r) => (
              <div key={r.id} className="rounded-lg border border-neutral-200 bg-white">
                <div className="grid grid-cols-[1.1fr,1.1fr,1fr,0.9fr] items-center gap-2 border-b bg-neutral-50 px-4 py-2 text-xs font-semibold text-neutral-600">
                  <span>{r.respondentName?.trim() ? r.respondentName : "Anonymous"}</span>
                  <span title={r.respondentEmail ?? "--"}>{r.respondentEmail?.trim() ? r.respondentEmail : "--"}</span>
                  <span>{new Date(r.submittedAt).toLocaleString()}</span>
                  <span>{r.score !== undefined && r.maxScore !== undefined ? `${r.score} / ${r.maxScore}` : "--"}</span>
                </div>
                <div className="divide-y">
                  {(r.answers ?? []).map((a) => {
                    const label = questionMap.get(a.questionId) ?? a.questionId;
                    const rendered = Array.isArray(a.value) ? a.value.join(", ") : String(a.value ?? "");
                    return (
                      <div key={a.questionId} className="grid grid-cols-[1fr,2fr] gap-3 px-4 py-2 text-sm">
                        <span className="font-medium text-neutral-800">{label}</span>
                        <span className="text-neutral-700">{rendered || "--"}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
