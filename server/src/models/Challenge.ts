import { randomId } from "../utils/random";
import { Bid } from "./Bid";
import { Player } from "./Player";

export class Challenge {
  private id: string;
  private bid: Bid;
  private result: boolean | null;
  private challenger: Player;
  private dice: number[];

  constructor(bid: Bid, challenger: Player, dice: number[]) {
    this.id = randomId();
    this.bid = bid;
    this.result = null;
    this.challenger = challenger;
    this.dice = dice;
  }

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

  public getId(): string {
    return this.id;
  }

  public getBid(): Bid {
    return this.bid;
  }

  public getResult(): boolean | null {
    return this.result;
  }

  public getChallenger(): Player {
    return this.challenger;
  }

  public getDice(): number[] {
    return this.dice;
  }
}

