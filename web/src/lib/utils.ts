export function cn(...values: Array<string | undefined | false | null>) {
  return values.filter(Boolean).join(" ");
}

export function generateId(prefix = "id") {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}
