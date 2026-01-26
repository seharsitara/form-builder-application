"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, logout } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000").replace(/\/$/, "");

export default function DashboardPage() {
  const router = useRouter();
  const [session] = useState(() => getSession());
  const [stats, setStats] = useState<{ forms: number; responses: number; loading: boolean; error?: string | null }>(() => ({ forms: 0, responses: 0, loading: true, error: null }));
  const [mounted, setMounted] = useState(false);
  const [showResponsesCard, setShowResponsesCard] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!session) {
      router.replace("/auth/login");
    }
  }, [router, session]);

  useEffect(() => {
    if (!mounted || !session?.token) return;
    let active = true;
    const loadStats = async () => {
      try {
        const formsRes = await fetch(`${API_BASE}/forms`, {
          headers: { Authorization: `Bearer ${session.token}` },
        });
        if (!formsRes.ok) throw new Error("Failed to load forms");
        const forms: { id: string; creatorId?: string }[] = await formsRes.json();
        const userForms = forms.filter((f) => f.creatorId === session.user.id);
        const formsCount = userForms.length;

        const responseCounts = await Promise.all(
          userForms.map(async (f) => {
            const res = await fetch(`${API_BASE}/forms/${f.id}/responses`, {
              headers: { Authorization: `Bearer ${session.token}` },
            });
            if (!res.ok) return 0;
            const data: unknown[] = await res.json();
            return Array.isArray(data) ? data.length : 0;
          })
        );

        if (!active) return;
        setStats({ forms: formsCount, responses: responseCounts.reduce((a, b) => a + b, 0), loading: false, error: null });
      } catch (err) {
        if (!active) return;
        setStats((prev) => ({ ...prev, loading: false, error: (err as Error).message }));
      }
    };

    loadStats();
    return () => {
      active = false;
    };
  }, [mounted, session]);

  if (!mounted) {
    return null;
  }

  if (!session) {
    return <p className="p-6 text-sm text-neutral-600">Redirecting to login...</p>;
  }

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-500">Welcome back</p>
            <h1 className="text-3xl font-semibold">{session.user.name}</h1>
            <p className="text-sm text-neutral-600">{session.user.email}</p>
          </div>
          <Badge tone="info">Role: {session.user.role}</Badge>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Your forms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-neutral-700">
              <p className="text-2xl font-semibold text-neutral-900">{stats.loading ? "--" : stats.forms}</p>
              <p className="text-neutral-600">Forms created</p>
              {stats.error && <p className="text-xs text-red-600">{stats.error}</p>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Responses received</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-neutral-700">
              <p className="text-2xl font-semibold text-neutral-900">{stats.loading ? "--" : stats.responses}</p>
              <p className="text-neutral-600">Total submissions across your forms</p>
              {stats.error && <p className="text-xs text-red-600">{stats.error}</p>}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Build a form</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-neutral-600">
                Create and manage forms. Quiz mode, required fields, sharing, and responses.
              </p>
              <Button onClick={() => router.push("/form-builder")}>Open builder</Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>View responses</CardTitle>
              <p className="text-sm text-neutral-600">Open the responses workspace to paste a link and review answers.</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/responses")}>Open</Button>
          </CardHeader>
        </Card>

        <div>
          <Button variant="outline" onClick={() => { logout(); router.push("/auth/login"); }}>
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
