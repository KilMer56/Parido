export function getCurrentDatetime(): string {
  const date = new Date();
  return date.toISOString();
}
