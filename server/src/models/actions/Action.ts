import { Player } from "../Player";

export enum ActionType {
  BID = "bid",
  CHALLENGE = "challenge",
}

export interface Action {
  getId(): string;
  getType(): string;
  getPlayer(): Player;
  getData(): any;
}

