import { randomId } from "../utils/random";

export class Player {
  private id: string;

  constructor() {
    this.id = randomId();
  }

  public getId(): string {
    return this.id;
  }
}

