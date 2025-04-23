export interface Player {
  id: string;
  name: string;
  socketId: string;
  active: boolean;
  diceCount?: number;
}

export interface Round {
  number: number;
  state: string;
  activePlayerSocketId: string;
  hand: number[];
  lastBid?: Bid | null;
  actions?: unknown;
}

export interface Bid {
  playerSocketId: string;
  quantity: number;
  value: number;
}

export type GameStatus = "waiting" | "in_progress" | "finished";

export interface GameState {
  gameId?: string;
  status: GameStatus;
  maxPlayers: number;
  players: Player[];
  currentRound?: Round;
  playerId?: string;
  playerSocketId?: string;
  logs?: unknown;
  winnerSocketId?: string;
  username?: string;
}

export class Game {
  private state: GameState;
  private updateState: (state: GameState) => void;

  public static createInitialState(): GameState {
    return {
      status: "waiting",
      maxPlayers: 5,
      players: [],
    };
  }

  constructor(updateState: (state: GameState) => void) {
    this.updateState = updateState;
    this.state = Game.createInitialState();
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
    return this.state.gameId || null;
  }

  public setStatus(status: GameStatus): void {
    this.setState({ status });
  }

  public setUsername(username: string): void {
    this.setState({ username });
  }

  public getUsername(): string | null {
    return this.state.username || null;
  }

  public getStatus(): GameStatus {
    return this.state.status;
  }

  public setMaxPlayers(maxPlayers: number): void {
    this.setState({ maxPlayers });
  }

  public getMaxPlayers(): number {
    return this.state.maxPlayers;
  }

  public setPlayers(players: Player[]): void {
    this.setState({ players });
  }

  public getPlayers(): Player[] {
    return this.state.players.filter((player) => player.active === true);
  }

  public getPlayerById(playerId: string): Player | undefined {
    return this.state.players.find((player) => player.id === playerId);
  }

  public setCurrentRound(round: Round): void {
    this.setState({ currentRound: round });
  }

  public getCurrentRound(): Round | null {
    return this.state.currentRound || null;
  }

  public setPlayerId(playerId: string): void {
    this.setState({ playerId });
  }

  public getPlayerId(): string | null {
    return this.state.playerId || null;
  }

  public setPlayerSocketId(socketId: string): void {
    this.setState({ playerSocketId: socketId });
  }

  public getPlayerSocketId(): string | null {
    return this.state.playerSocketId || null;
  }

  public isPlayerTurn(): boolean {
    return (
      this.state.currentRound?.activePlayerSocketId === this.getPlayerSocketId()
    );
  }

  public canStart(): boolean {
    return this.state.status === "waiting" && this.state.players.length > 1;
  }

  public setLogs(logs: unknown): void {
    this.setState({ logs });
  }

  public getLogs(): unknown {
    return this.state.logs;
  }

  public setWinnerSocketId(winnerSocketId: string): void {
    this.setState({ winnerSocketId });
  }

  public getWinner(): Player | null {
    return (
      this.state.players.find(
        (player) => player.socketId === this.state.winnerSocketId
      ) || null
    );
  }
}

