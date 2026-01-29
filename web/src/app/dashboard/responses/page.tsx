"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSession, logout } from "@/lib/auth";
import { API_BASE } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Question } from "@/lib/types";

type ResponseRow = {
  id: string;
  createdAt: string;
  respondent?: string | null;
  respondentEmail?: string | null;
  score?: number | null;
  maxScore?: number | null;
  answers: { questionId: string; value: string | string[] }[];
};

type ApiForm = {
  id: string;
  title: string;
  description?: string | null;
  isQuiz?: boolean;
  questions?: Array<{
    id: string;
    label: string;
    type: Question["type"];
    required?: boolean;
    options?: string[];
    correctAnswers?: string[];
  }>;
};

type ApiResponse = {
  id: string;
  createdAt: string;
  respondent?: string | null;
  respondentEmail?: string | null;
  userId?: string | null;
  score?: number | null;
  maxScore?: number | null;
  answers?: Array<{ id: string; questionId: string; value: string | string[] }>;
};

function parseFormId(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const parts = trimmed.split("/").filter(Boolean);
  return parts.length ? parts[parts.length - 1] : "";
}

function parseAnswerValue(value: string | string[]) {
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed as string[];
  } catch {
  }
  return value;
}

async function extractError(res: Response) {
  try {
    const data = await res.json();
    if (typeof data?.message === "string") return data.message;
    if (Array.isArray(data?.message)) return data.message.join(", ");
  } catch {
    
  }
  return res.statusText;
}

export default function ResponsesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [session] = useState(() => getSession());
  const [mounted, setMounted] = useState(false);

  const [formInput, setFormInput] = useState(() => searchParams?.get("form") ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [responses, setResponses] = useState<ResponseRow[]>([]);
  const [selectedResponse, setSelectedResponse] = useState<ResponseRow | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [formTitle, setFormTitle] = useState<string>("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !session) {
      router.replace("/auth/login");
    }
  }, [mounted, router, session]);

  const loadResponses = useCallback(
    async (input?: string) => {
      const target = parseFormId(input ?? formInput);
      if (!target) {
        setError("Paste a form link or enter a form ID.");
        return;
      }
      setLoading(true);
      setError(null);

      const headers: HeadersInit = session?.token ? { Authorization: `Bearer ${session.token}` } : {};

      try {
        const formRes = await fetch(`${API_BASE}/forms/${target}`, { headers });
        if (!formRes.ok) throw new Error(await extractError(formRes));
        const formData = (await formRes.json()) as ApiForm;

        const responsesRes = await fetch(`${API_BASE}/forms/${target}/responses`, { headers });
        if (!responsesRes.ok) throw new Error(await extractError(responsesRes));
        const responseData = (await responsesRes.json()) as ApiResponse[];

        const mappedQuestions: Question[] = (formData.questions ?? []).map((q) => ({
          id: q.id,
          title: q.label,
          description: "",
          type: q.type,
          required: Boolean(q.required),
          options: (q.options ?? []).map((opt) => ({ id: opt, label: opt })),
          correctAnswers: q.correctAnswers ?? [],
          marks: formData.isQuiz ? 1 : undefined,
        }));

        const mappedResponses: ResponseRow[] = (responseData ?? []).map((r) => ({
          id: r.id,
          createdAt: r.createdAt,
          respondent: r.respondent ?? "",
          respondentEmail: r.respondentEmail ?? "",
          score: r.score ?? null,
          maxScore: r.maxScore ?? null,
          answers: (r.answers ?? []).map((a) => ({
            questionId: a.questionId,
            value: parseAnswerValue(a.value),
          })),
        }));

        setFormTitle(formData.title ?? "");
        setQuestions(mappedQuestions);
        setResponses(mappedResponses);
        setSelectedResponse(mappedResponses[0] ?? null);
        const current = searchParams?.get("form");
        if (current !== target) {
          router.replace(`/dashboard/responses?form=${target}`);
        }
      } catch (err) {
        setError((err as Error).message || "Failed to load responses.");
        setResponses([]);
        setSelectedResponse(null);
      } finally {
        setLoading(false);
      }
    },
    [formInput, router, searchParams, session?.token]
  );

  useEffect(() => {
    const initial = searchParams?.get("form");
    if (!mounted || !session || !initial) return;
    setFormInput(initial);
    void loadResponses(initial);
  }, [loadResponses, mounted, searchParams, session]);

  const selectedAnswers = useMemo(() => {
    if (!selectedResponse) return [] as { questionId: string; value: string | string[] }[];
    return selectedResponse.answers;
  }, [selectedResponse]);

  if (!mounted) return null;
  if (!session) return <p className="p-6 text-sm text-neutral-600">Redirecting to login...</p>;

  return (
    <div className="min-h-screen bg-neutral-100 px-4 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-neutral-500">Responses workspace</p>
            <h1 className="text-3xl font-semibold text-neutral-900">Review submissions</h1>
            {formTitle && <p className="text-sm text-neutral-600">{formTitle}</p>}
          </div>
          <div className="flex items-center gap-3">
            <Badge tone="info">Role: {session.user.role}</Badge>
            <Button variant="outline" onClick={() => { logout(); router.push("/auth/login"); }}>
              Logout
            </Button>
          </div>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Load responses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-neutral-600">Paste a form link (or ID) to load its submissions. You must own the form.</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                placeholder="https://.../forms/your-form-id or form id"
                value={formInput}
                onChange={(e) => setFormInput(e.target.value)}
              />
              <div className="flex gap-2">
                <Button onClick={() => void loadResponses()} disabled={loading}>
                  {loading ? "Loading..." : "Load"}
                </Button>
                <Button variant="outline" onClick={() => router.push("/dashboard")}>Back</Button>
              </div>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Submissions</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-xs uppercase text-neutral-600">
                    <th className="px-3 py-2">#</th>
                    <th className="px-3 py-2">Respondent</th>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Submitted</th>
                    <th className="px-3 py-2">Score</th>
                    <th className="px-3 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {responses.map((r, idx) => (
                    <tr key={r.id} className="border-b last:border-0">
                      <td className="px-3 py-2 text-neutral-700">{idx + 1}</td>
                      <td className="px-3 py-2 text-neutral-800">{r.respondent?.trim() ? r.respondent : "Anonymous"}</td>
                      <td className="px-3 py-2 text-neutral-700">{r.respondentEmail?.trim() ? r.respondentEmail : "--"}</td>
                      <td className="px-3 py-2 text-neutral-700">{new Date(r.createdAt).toLocaleString()}</td>
                      <td className="px-3 py-2 text-neutral-700">{r.score !== null && r.maxScore !== null ? `${r.score} / ${r.maxScore}` : "--"}</td>
                      <td className="px-3 py-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            setSelectedResponse(r);
                          }}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {!responses.length && (
                    <tr>
                      <td colSpan={6} className="px-3 py-4 text-center text-sm text-neutral-500">
                        {loading ? "Loading responses..." : "No responses loaded."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader className="flex items-center justify-between gap-2">
              <CardTitle>Response detail</CardTitle>
              {selectedResponse && (
                <Button variant="ghost" size="sm" onClick={() => setSelectedResponse(null)}>
                  Clear
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {!selectedResponse && <p className="text-sm text-neutral-600">Select a response to inspect answers.</p>}
              {selectedResponse && (
                <div className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="text-sm text-neutral-700">
                      <p className="font-medium text-neutral-900">Name</p>
                      <p>{selectedResponse.respondent?.trim() ? selectedResponse.respondent : "Anonymous"}</p>
                    </div>
                    <div className="text-sm text-neutral-700">
                      <p className="font-medium text-neutral-900">Email</p>
                      <p>{selectedResponse.respondentEmail?.trim() ? selectedResponse.respondentEmail : "--"}</p>
                    </div>
                    <div className="text-sm text-neutral-700">
                      <p className="font-medium text-neutral-900">Submitted</p>
                      <p>{new Date(selectedResponse.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="text-sm text-neutral-700">
                      <p className="font-medium text-neutral-900">Score</p>
                      <p>
                        {selectedResponse.score !== null && selectedResponse.maxScore !== null
                          ? `${selectedResponse.score} / ${selectedResponse.maxScore}`
                          : "--"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {questions.map((q) => {
                      const answer = selectedAnswers.find((a) => a.questionId === q.id);
                      const value = Array.isArray(answer?.value)
                        ? answer?.value.join(", ")
                        : (answer?.value as string | undefined);
                      return (
                        <div key={q.id} className="rounded-md border border-neutral-200 bg-neutral-50 p-3">
                          <p className="text-sm font-medium text-neutral-900">{q.title}</p>
                          <p className="text-sm text-neutral-700">{value?.trim() ? value : "--"}</p>
                          {q.correctAnswers && q.correctAnswers.length > 0 && (
                            <p className="mt-1 text-xs text-emerald-700">Correct: {q.correctAnswers.join(", ")}</p>
                          )}
                        </div>
                      );
                    })}
                    {!questions.length && (
                      <p className="text-sm text-neutral-600">Question details not available for this form.</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
