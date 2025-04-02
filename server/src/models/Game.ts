import { randomId } from "../utils/random";
import { Player } from "./Player";
import { Round } from "./Round";

export enum GameStatus {
  WAITING,
  ONGOING,
  FINISHED,
}

export class Game {
  private id: string;
  private players: Player[];
  private status: GameStatus;
  private currentRound: Round | null;
  private rounds: Round[];
  private maxPlayers: number;

  constructor() {
    this.id = randomId();
    this.players = [];
    this.status = GameStatus.WAITING;
    this.currentRound = null;
    this.rounds = [];
    this.maxPlayers = 2;
  }

  public addPlayer(player: Player): boolean {
    if (
      this.players.length < this.maxPlayers &&
      this.status === GameStatus.WAITING
    ) {
      this.players.push(player);
      return true;
    }
    return false;
  }

  public removePlayer(player: Player) {
    this.players = this.players.filter((p) => p.getId() !== player.getId());
  }

  public start() {
    if (this.players.length > 1 && this.status === GameStatus.WAITING) {
      this.status = GameStatus.ONGOING;
      this.startNewRound();
      return true;
    }
    return false;
  }

  private startNewRound() {
    this.players.forEach((player) => {
      player.rollDice();
    });

    const roundNumber = this.rounds.length + 1;
    const firstPlayer = this.players[0];
    this.currentRound = new Round(roundNumber, firstPlayer);
    this.rounds.push(this.currentRound);
  }

  public endRound() {
    if (this.currentRound) {
      this.currentRound.end();
      this.currentRound.getLoser()?.removeDice();

      // Check if game is finished (only one player remains)
      const activePlayers = this.players.filter((p) => p.isActive());
      if (activePlayers.length <= 1) {
        this.status = GameStatus.FINISHED;
      } else {
        this.startNewRound();
      }
    }
  }

  public getActiveDices(): number[] {
    return this.players.flatMap((player) => player.getHand());
  }

  public end() {
    this.status = GameStatus.FINISHED;
  }

  public getId(): string {
    return this.id;
  }

  public getPlayers(): Player[] {
    return this.players;
  }

  public getPlayer(playerId: string): Player | undefined {
    return this.players.find((player) => player.getId() === playerId);
  }

  public getPlayerBySocketId(socketId: string): Player | undefined {
    return this.players.find((player) => player.getSocketId() === socketId);
  }

  public getMaxPlayers(): number {
    return this.maxPlayers;
  }

  public getNextPlayer(player: Player) {
    const currentIndex = this.players.indexOf(player);
    const nextIndex = (currentIndex + 1) % this.players.length;
    return this.players[nextIndex];
  }

  public getStatus(): GameStatus {
    return this.status;
  }

  public getCurrentRound(): Round | null {
    return this.currentRound;
  }

  public getRounds(): Round[] {
    return this.rounds;
  }

  public setStatus(state: GameStatus) {
    this.status = state;
  }
}

