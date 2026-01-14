import React from "react";
import { Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Submission } from "@/lib/types";

export type ResponsesCardProps = {
  responses: Submission[];
  onExport: () => void;
  onRefresh?: () => void;
};

export function ResponsesCard({ responses, onExport, onRefresh }: ResponsesCardProps) {
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
          <div className="overflow-hidden rounded-lg border border-neutral-200">
            <div className="grid grid-cols-[1.3fr,1.3fr,1fr,0.9fr] bg-neutral-50 px-4 py-2 text-xs font-semibold text-neutral-600">
              <span>Respondent</span>
              <span>Email</span>
              <span>Submitted</span>
              <span>Score</span>
            </div>
            <div className="divide-y">
              {responses.map((r) => (
                <div key={r.id} className="grid grid-cols-[1.3fr,1.3fr,1fr,0.9fr] items-center px-4 py-2 text-sm">
                  <div className="space-y-0.5">
                    <span className="block truncate font-medium">
                      {r.respondentName?.trim() ? r.respondentName : "Anonymous"}
                    </span>
                    <span className="block truncate text-xs text-neutral-500" title={r.id}>
                      ID: {r.id}
                    </span>
                  </div>
                  <span className="truncate" title={r.respondentEmail ?? "--"}>
                    {r.respondentEmail?.trim() ? r.respondentEmail : "--"}
                  </span>
                  <span>{new Date(r.submittedAt).toLocaleString()}</span>
                  <span>
                    {r.score !== undefined && r.maxScore !== undefined ? `${r.score} / ${r.maxScore}` : "--"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
