"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-100">
      <header className="sticky top-0 z-10 border-b border-white/30 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-lg font-semibold text-neutral-900">
            Form Builder
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/auth/login" className="text-sm text-neutral-700 hover:text-neutral-900 bg-neutral-100 h-9 px-3 inline-flex items-center justify-center rounded-md">
              Login
            </Link>
            <Link href="/auth/register">
              <Button size="sm">Register</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col items-center gap-10 px-4 py-16 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-semibold text-neutral-900 sm:text-5xl">
            Sign up or log in to build and share forms
          </h1>
          <p className="text-lg text-neutral-600">
            Create forms, quizzes, and collect responses. Log in to access your dashboard and builder; respondents can use shared links without an
            account.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/auth/register">
            <Button className="px-6 py-3 text-base">Create account</Button>
          </Link>
          <Link href="/auth/login">
            <Button variant="outline" className="px-6 py-3 text-base">
              Log in
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="ghost" className="px-6 py-3 text-base text-neutral-700 bg-white/90 hover:bg-white/70">
              Go to dashboard
            </Button>
          </Link>
        </div>

        <div className="grid w-full gap-4 rounded-2xl border border-white/40 bg-white/80 p-6 text-left shadow-lg backdrop-blur sm:grid-cols-3">
          <Feature title="Form creators" description="Register/login to design forms, quizzes, and manage responses." />
          <Feature title="Respondents" description="Use share links to submit answers without logging in." />
          <Feature title="Dashboard" description="After login, jump to your dashboard and open the builder." />
        </div>
      </main>
    </div>
  );
}

function Feature({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
      <p className="text-sm text-neutral-600">{description}</p>
    </div>
  );
}
