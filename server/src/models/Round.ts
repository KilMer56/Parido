import { randomId } from "../utils/random";
import { Player } from "./Player";
import { Bid } from "./Bid";
import { Challenge } from "./Challenge";

export enum RoundState {
  ACTIVE,
  FINISHED,
}

export class Round {
  private id: string;
  private number: number;
  private activePlayer: Player;
  private actions: (Bid | Challenge)[];
  private lastBid: Bid | null;
  private winner: Player | null;
  private state: RoundState;

  constructor(number: number, activePlayer: Player) {
    this.id = randomId();
    this.number = number;
    this.activePlayer = activePlayer;
    this.actions = [];
    this.lastBid = null;
    this.winner = null;
    this.state = RoundState.ACTIVE;
  }

  public end(winner: Player) {
    this.winner = winner;
    this.state = RoundState.FINISHED;
  }

  public getId(): string {
    return this.id;
  }

  public getNumber(): number {
    return this.number;
  }

  public getActivePlayer(): Player {
    return this.activePlayer;
  }

  public setActivePlayer(player: Player) {
    this.activePlayer = player;
  }

  public getActions(): (Bid | Challenge)[] {
    return this.actions;
  }

  public addAction(action: Bid | Challenge) {
    this.actions.push(action);
  }

  public placeBid(quantity: number, value: number): Bid {
    if (this.state !== RoundState.ACTIVE) {
      throw new Error("Cannot place a bid when the round is not active.");
    }
    if (this.lastBid) {
      if (quantity < this.lastBid.getQuantity()) {
        throw new Error(
          "Bid quandity must be higher than the last bid quantity."
        );
      }
      if (
        quantity === this.lastBid.getQuantity() &&
        value <= this.lastBid.getValue()
      ) {
        throw new Error(
          "Bid value must be higher than the last bid value when quantity are equals."
        );
      }
    }
    const bid = new Bid(this.activePlayer, quantity, value);
    this.actions.push(bid);
    this.lastBid = bid;
    return bid;
  }

  public placeChallenge(bid: Bid, challenger: Player): Challenge {
    const challenge = new Challenge(bid, challenger);
    this.actions.push(challenge);
    return challenge;
  }

  public getWinner(): Player | null {
    return this.winner;
  }

  public setWinner(player: Player) {
    this.winner = player;
    this.state = RoundState.FINISHED;
  }

  public getState(): RoundState {
    return this.state;
  }

  public setState(state: RoundState) {
    this.state = state;
  }
}

