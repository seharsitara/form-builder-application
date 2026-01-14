import React from "react";
import { Share2, Copy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export type ShareCardProps = {
  shareLink: string;
  onCopy: () => void;
};

export function ShareCard({ shareLink, onCopy }: ShareCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg">Share & access</CardTitle>
          <Share2 size={16} className="text-neutral-500" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Input value={shareLink} readOnly />
          <Button variant="outline" size="icon" onClick={onCopy} aria-label="Copy share link">
            <Copy size={16} />
          </Button>
        </div>
        <p className="text-sm text-neutral-600">
          Anyone with the link can submit. Toggle single submission or close responses to control access.
        </p>
      </CardContent>
    </Card>
  );
}
