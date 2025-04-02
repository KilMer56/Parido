import { randomId } from "../../utils/random";
import { Action, ActionType } from "./Action";
import { Bid } from "./Bid";
import { Player } from "../Player";

export class Challenge implements Action {
  private id: string;
  private bid: Bid;
  private result: boolean | null;
  private player: Player;
  private dice: number[];

  constructor(bid: Bid, player: Player, dice: number[]) {
    this.id = randomId();
    this.bid = bid;
    this.result = null;
    this.player = player;
    this.dice = dice;
  }

  // Action interface methods

  public getId(): string {
    return this.id;
  }

  public getPlayer(): Player {
    return this.player;
  }

  public getType(): string {
    return ActionType.CHALLENGE;
  }

  public getData(): any {
    return {
      bidId: this.bid.getId(),
      result: this.result,
    };
  }

  // Challenge specific methods

  public resolve(): boolean {
    const targetDices = this.dice.filter(
      (dice) => dice === this.bid.getValue()
    );
    if (targetDices.length >= this.bid.getQuantity()) {
      this.result = false;
    } else {
      this.result = true;
    }

    return this.result;
  }

  public getBid(): Bid {
    return this.bid;
  }

  public getResult(): boolean | null {
    return this.result;
  }

  public getDice(): number[] {
    return this.dice;
  }
}

