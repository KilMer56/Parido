export function randomId(): string {
  return Math.random().toString(36).substring(2, 8);
}

export function randomInt(limit: number): number {
  return Math.floor(Math.random() * limit) + 1;
}
