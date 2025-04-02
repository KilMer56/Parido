import { randomId } from "../utils/random";
import { Player } from "./Player";
import { Action } from "./actions/Action";
import { Bid } from "./actions/Bid";
import { Challenge } from "./actions/Challenge";

export enum RoundState {
  ACTIVE,
  FINISHED,
}

export class Round {
  private id: string;
  private number: number;
  private previousPlayer: Player | null;
  private activePlayer: Player;
  private actions: Action[];
  private lastBid: Bid | null;
  private loser: Player | null;
  private state: RoundState;

  constructor(number: number, activePlayer: Player) {
    this.id = randomId();
    this.number = number;
    this.previousPlayer = null;
    this.activePlayer = activePlayer;
    this.actions = [];
    this.lastBid = null;
    this.loser = null;
    this.state = RoundState.ACTIVE;
  }

  public end() {
    this.state = RoundState.FINISHED;
  }

  public getId(): string {
    return this.id;
  }

  public getNumber(): number {
    return this.number;
  }

  public getPreviousPlayer(): Player | null {
    return this.previousPlayer;
  }

  public getActivePlayer(): Player {
    return this.activePlayer;
  }

  public setActivePlayer(player: Player) {
    this.previousPlayer = this.activePlayer;
    this.activePlayer = player;
  }

  public getActions(): Action[] {
    return this.actions;
  }

  public addAction(action: Action) {
    this.actions.push(action);
  }

  public placeBid(bidder: Player, quantity: number, value: number): Bid {
    if (this.state !== RoundState.ACTIVE) {
      throw new Error("Cannot place a bid when the round is not active.");
    }
    if (bidder !== this.activePlayer) {
      throw new Error("You can't bid right now");
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

  public challengeBid(challenger: Player, dices: number[]): Challenge {
    if (this.state !== RoundState.ACTIVE) {
      throw new Error("Cannot place a bid when the round is not active.");
    }
    if (!this.lastBid || !this.previousPlayer) {
      throw new Error(
        "Cannot challenge when there is not bid or no previous player"
      );
    }
    if (challenger !== this.activePlayer) {
      throw new Error("You can't challenge right now");
    }
    const challenge = new Challenge(this.lastBid, challenger, dices);
    this.actions.push(challenge);

    // Resolving challenge
    const success = challenge.resolve();
    this.loser = success ? this.previousPlayer : this.activePlayer;

    return challenge;
  }

  public getLoser(): Player | null {
    return this.loser;
  }

  public getLastBid(): Bid | null {
    return this.lastBid;
  }

  public getState(): RoundState {
    return this.state;
  }

  public setState(state: RoundState) {
    this.state = state;
  }
}

