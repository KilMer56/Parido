import { randomId } from "../utils/random";

export class Player {
  private id: string;
  private name: string;
  private diceCount: number;
  private hand: number[];
  private isActive: boolean;
  private socketId: string;

  constructor(socketId: string, name: string, diceCount: number = 5) {
    this.id = randomId();
    this.name = name;
    this.diceCount = diceCount;
    this.hand = Array(diceCount).fill(0);
    this.isActive = true;
    this.socketId = socketId;
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

  public isPlayerActive(): boolean {
    return this.isActive;
  }

  public setActive(active: boolean) {
    this.isActive = active;
  }

  public getSocketId(): string {
    return this.socketId;
  }

  public loseDice() {
    if (this.diceCount > 0) {
      this.diceCount--;
      this.hand = this.hand.slice(0, this.diceCount);
    }
  }

  public setDiceCount(count: number) {
    this.diceCount = count;
    this.hand = Array(count).fill(0);
  }
}

