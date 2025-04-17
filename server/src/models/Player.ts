import { randomId } from "../utils/random";

export class Player {
  private id: string;
  private name: string;
  private diceCount: number;
  private hand: number[];
  private active: boolean;
  private socketId: string;

  constructor(socketId: string, name: string, diceCount: number = 5) {
    this.id = randomId();
    this.diceCount = diceCount;
    this.hand = Array(diceCount).fill(0);
    this.active = true;
    this.socketId = socketId;
    this.name = "Player"; // Default before setting the name
    this.cleanAndSetName(name);
  }

  private cleanAndSetName(name: string) {
    // Remove leading and trailing spaces
    name = name.trim();

    // Reduces size of the name
    if (name.length > 12) {
      name = name.slice(0, 11);
    }
    if (name.length === 0) {
      name = "Player";
    }

    this.name = name;
  }

  public rollDice() {
    this.hand = this.hand.map(() => Math.floor(Math.random() * 6) + 1);
  }

  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getDiceCount(): number {
    return this.diceCount;
  }

  public getHand(): number[] {
    return this.hand;
  }

  public isActive(): boolean {
    return this.active;
  }

  public setActive(active: boolean) {
    this.active = active;
  }

  public getSocketId(): string {
    return this.socketId;
  }

  public removeDice() {
    if (this.diceCount > 0) {
      this.diceCount--;
      this.hand = this.hand.slice(0, this.diceCount);
    }

    if (this.diceCount === 0) {
      this.active = false;
    }
  }
}

