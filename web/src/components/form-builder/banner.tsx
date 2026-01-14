import React from "react";

export type BannerProps = {
  tone: "success" | "error" | "info";
  message: string;
};

export function Banner({ tone, message }: BannerProps) {
  const toneClass =
    tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : tone === "error"
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-blue-200 bg-blue-50 text-blue-700";

  return (
    <div className={`rounded-md border px-4 py-3 text-sm ${toneClass}`}>{message}</div>
  );
}
