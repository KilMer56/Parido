export function randomId(): string {
  return Math.random().toString(36).substring(2, 8);
}

export function randomInt(limit: number): number {
  return Math.floor(Math.random() * limit) + 1;
}

let names = ["Diago", "Nadox", "Liquid", "Blue"];

export function randomName(): string {
  if (names.length === 0) {
    throw new Error("No names left in the list");
  }
  const index = Math.floor(Math.random() * names.length);
  return names.splice(index, 1)[0];
}
