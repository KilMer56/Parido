import { randomId } from "../utils/random";
import { Player } from "./Player";

export class Bid {
  private id: string;
  private player: Player;
  private quantity: number;
  private value: number;

  constructor(player: Player, quantity: number, value: number) {
    this.id = randomId();
    this.player = player;
    this.quantity = quantity;
    this.value = value;
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

  public getPlayer(): Player {
    return this.player;
  }
}
