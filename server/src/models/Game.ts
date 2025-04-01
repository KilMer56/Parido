import { randomId } from "../utils/random";
import { Player } from "./Player";

export class Game {
  private id: string;
  private players: Player[];

  constructor() {
    this.id = randomId();
    this.players = [];
  }

  getId() {
    return this.id;
  }

  addPlayer(player: Player) {
    this.players.push(player);
  }

  removePlayer(playerId: string) {
    this.players = this.players.filter((player) => player.getId() !== playerId);
  }

  getPlayers() {
    return this.players;
  }

  getPlayer(playerId: string) {
    return this.players.find((player) => player.getId() === playerId);
  }
}

