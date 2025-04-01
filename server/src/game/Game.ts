import { Player } from "./Player";

export class Game {
  private id: string;
  private players: Player[];

  constructor() {
    this.id = Math.random().toString(36).substring(2, 8);
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

