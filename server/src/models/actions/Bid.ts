import { randomId } from "../../utils/random";
import { Player } from "../Player";
import { Action, ActionType } from "./Action";

export class Bid implements Action {
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

  // Action interface methods

  public getId(): string {
    return this.id;
  }

  public getPlayer(): Player {
    return this.player;
  }

  public getType(): string {
    return ActionType.BID;
  }

  public getData(): any {
    return {
      quantity: this.quantity,
      value: this.value,
    };
  }

  // Bid specific methods

  public getQuantity(): number {
    return this.quantity;
  }

  public getValue(): number {
    return this.value;
  }
}

