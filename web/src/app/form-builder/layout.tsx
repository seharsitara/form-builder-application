"use client";

import React from "react";
import { FormBuilderProvider } from "@/context/form-builder-context";

export default function FormBuilderLayout({ children }: { children: React.ReactNode }) {
  return <FormBuilderProvider>{children}</FormBuilderProvider>;
}
