export interface Player {
  id: string;
  name: string;
  socketId: string;
  hand: number[];
}

export type GameStatus = "waiting" | "in_progress" | "finished";

export interface GameState {
  gameId: string | null;
  timestamp: string | null;
  maxPlayers: number;
  status: GameStatus;
  players: Player[];
  currentPlayerSocketId: string | null;
}

export class Game {
  private state: GameState;
  private updateState: (state: GameState) => void;

  public static createInitialState(): GameState {
    return {
      gameId: null,
      timestamp: null,
      maxPlayers: 2,
      status: "waiting",
      players: [],
      currentPlayerSocketId: null,
    };
  }

  constructor(updateState: (state: GameState) => void) {
    this.updateState = updateState;
    this.state = Game.createInitialState();
  }

  public getState(): GameState {
    return { ...this.state };
  }

  public setState(partialState: Partial<GameState>): void {
    this.state = {
      ...this.state,
      ...partialState,
    };
    this.updateState(this.state);
  }

  public setGameId(gameId: string): void {
    this.setState({ gameId });
  }

  public getGameId(): string | null {
    return this.state.gameId;
  }

  public setTimestamp(timestamp: string): void {
    this.setState({ timestamp });
  }

  public setStatus(status: GameStatus): void {
    this.setState({ status });
  }

  public setPlayers(players: Player[]): void {
    this.setState({ players });
  }

  public setCurrentPlayerSocketId(socketId: string): void {
    this.setState({ currentPlayerSocketId: socketId });
  }

  public getCurrentPlayerSocketId(): string | null {
    return this.state.currentPlayerSocketId;
  }

  public isCurrentPlayer(socketId: string): boolean {
    return this.state.currentPlayerSocketId === socketId;
  }

  public addPlayer(player: Player): void {
    this.setState({
      players: [...this.state.players, player],
    });
  }

  public removePlayer(playerId: string): void {
    this.setState({
      players: this.state.players.filter((p) => p.id !== playerId),
    });
  }

  public canStart(): boolean {
    return this.state.status === "waiting" && this.state.players.length > 1;
  }

  public isFull(): boolean {
    return this.state.players.length >= this.state.maxPlayers;
  }

  public hasStarted(): boolean {
    return this.state.status === "in_progress";
  }

  public reset(): void {
    this.state = Game.createInitialState();
    this.updateState(this.state);
  }

  // Game logic methods moved from types/game.ts
  public getPlayerCountText(): string {
    return `Waiting for players (${this.state.players.length}/${this.state.maxPlayers})`;
  }

  public getStatusText(): string {
    return this.state.status === "in_progress"
      ? "Game in progress"
      : this.getPlayerCountText();
  }
}
