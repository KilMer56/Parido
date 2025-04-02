import { randomId } from "../utils/random";

export class Bid {
  private id: string;
  private quantity: number;
  private value: number;
  private playerId: string;

  constructor(quantity: number, value: number, playerId: string) {
    this.id = randomId();
    this.quantity = quantity;
    this.value = value;
    this.playerId = playerId;
  }

  public getId(): string {
    return this.id;
  }

  public getQuantity(): number {
    return this.quantity;
  }

  public getValue(): number {
    return this.value;
  }

  public getPlayerId(): string {
    return this.playerId;
  }
} 