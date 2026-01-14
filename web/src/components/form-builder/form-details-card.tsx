import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { FormDefinition } from "@/lib/types";

export type FormDetailsCardProps = {
  form: FormDefinition;
  onUpdate: (form: FormDefinition) => void;
  onCopyLink: () => void;
};

export function FormDetailsCard({ form, onUpdate, onCopyLink }: FormDetailsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle>Form details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          value={form.title}
          onChange={(e) => onUpdate({ ...form, title: e.target.value })}
          placeholder="Form title"
        />
        <Textarea
          value={form.description}
          onChange={(e) => onUpdate({ ...form, description: e.target.value })}
          placeholder="Description"
          rows={3}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <Switch
            checked={form.settings.quizMode}
            onCheckedChange={(quizMode) => onUpdate({ ...form, settings: { ...form.settings, quizMode } })}
            label="Enable quiz mode"
          />
          <Switch
            checked={form.settings.showResult}
            onCheckedChange={(showResult) => onUpdate({ ...form, settings: { ...form.settings, showResult } })}
            label="Show result after submit"
          />
          <Switch
            checked={form.settings.singleSubmission}
            onCheckedChange={(singleSubmission) =>
              onUpdate({ ...form, settings: { ...form.settings, singleSubmission } })
            }
            label="Single submission"
          />
          <Switch
            checked={form.settings.isClosed}
            onCheckedChange={(isClosed) => onUpdate({ ...form, settings: { ...form.settings, isClosed } })}
            label={form.settings.isClosed ? "Responses closed" : "Responses open"}
          />
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={form.shareLink}
            onChange={(e) => onUpdate({ ...form, shareLink: e.target.value })}
          />
          <Button variant="outline" size="icon" onClick={onCopyLink} aria-label="Copy link">
            <Copy size={16} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
