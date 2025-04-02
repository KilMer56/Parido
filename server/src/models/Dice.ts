import { randomInt } from "../utils/random";

export class Dice {
  private value: number;
  private usable: boolean;

  public constructor() {
    this.value = randomInt(6);
    this.usable = true;
  }

  public roll(): void {
    this.value = randomInt(6);
  }

  public getValue(): number {
    return this.value;
  }

  public isUsable(): boolean {
    return this.usable;
  }

  public setUsable(usable: boolean): void {
    this.usable = usable;
  }
}

