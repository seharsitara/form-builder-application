"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, logout } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const router = useRouter();
  const [session] = useState(() => getSession());

  useEffect(() => {
    if (!session) {
      router.replace("/auth/login");
    }
  }, [router, session]);

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
              <CardTitle>Build a form</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-neutral-600">
                Create and manage forms. Quiz mode, required fields, sharing, and responses.
              </p>
              <Button onClick={() => router.push("/form-builder")}>Open builder</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Respond to a form</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-neutral-600">
                Paste a shared link to submit a response as a public user.
              </p>
              <Button variant="outline" onClick={() => router.push("/forms/example-id")}>Open shared form</Button>
            </CardContent>
          </Card>
        </div>

        <div>
          <Button variant="outline" onClick={() => { logout(); router.push("/auth/login"); }}>
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
