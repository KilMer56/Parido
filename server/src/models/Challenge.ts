import { randomId } from "../utils/random";
import { Bid } from "./Bid";
import { Player } from "./Player";

export class Challenge {
  private id: string;
  private bid: Bid;
  private result: boolean | null;
  private challenger: Player;

  constructor(bid: Bid, challenger: Player) {
    this.id = randomId();
    this.bid = bid;
    this.result = null;
    this.challenger = challenger;
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

  public setResult(result: boolean) {
    this.result = result;
  }

  public getChallenger(): Player {
    return this.challenger;
  }
}
