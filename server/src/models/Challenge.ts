import { randomId } from "../utils/random";
import { Bid } from "./Bid";

export class Challenge {
  private id: string;
  private bid: Bid;
  private result: boolean | null;
  private challengerId: string;

  constructor(bid: Bid, challengerId: string) {
    this.id = randomId();
    this.bid = bid;
    this.result = null;
    this.challengerId = challengerId;
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

  public getChallengerId(): string {
    return this.challengerId;
  }
} 