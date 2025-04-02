import { randomId } from "../utils/random";
import { Player } from "./Player";

export enum GameStatus {
  WAITING,
  ONGOING,
  DONE,
}

export class Game {
  private id: string;
  private players: Player[];
  private status: GameStatus;
  private currentBid: number | null;
  private maxPlayers: number;

  constructor() {
    this.id = randomId();
    this.players = [];
    this.status = GameStatus.WAITING;
    this.currentBid = null;
    this.maxPlayers = 2;
  }

  addPlayer(player: Player): boolean {
    if (this.players.length < this.maxPlayers && this.status === GameStatus.WAITING) {
      this.players.push(player);
      return true;
    }
    return false;
  }

  removePlayer(player: Player) {
    this.players = this.players.filter((p) => p.getId() !== player.getId());
  }

  start() {
    if (this.canStart()) {
      this.status = GameStatus.ONGOING;
      this.players.forEach((player) => {
        player.rollDices();
      });
      return true;
    }
    return false;
  }

  canStart(): boolean {
    return this.players.length > 1 && this.status === GameStatus.WAITING;
  }

  getId() {
    return this.id;
  }

  getPlayers() {
    return this.players;
  }

  getPlayer(playerId: string) {
    return this.players.find((player) => player.getId() === playerId);
  }

  getMaxPlayers() {
    return this.maxPlayers;
  }

  getStatus(): GameStatus {
    return this.status;
  }
}

