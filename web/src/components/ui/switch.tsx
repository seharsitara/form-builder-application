import * as React from "react";
import { cn } from "@/lib/utils";

export type SwitchProps = {
  checked: boolean;
  onCheckedChange?: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
};

export function Switch({ checked, onCheckedChange, label, disabled }: SwitchProps) {
  return (
    <button
      type="button"
      className={cn(
        "flex items-center gap-2 text-sm font-medium text-neutral-800",
        disabled && "opacity-60"
      )}
      onClick={() => !disabled && onCheckedChange?.(!checked)}
      aria-pressed={checked}
      disabled={disabled}
    >
      <span
        className={cn(
          "relative inline-flex h-6 w-10 items-center rounded-full transition-colors",
          checked ? "bg-black" : "bg-neutral-200"
        )}
      >
        <span
          className={cn(
            "inline-block h-5 w-5 rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-4" : "translate-x-0.5"
          )}
        />
      </span>
      {label && <span>{label}</span>}
    </button>
  );
}
