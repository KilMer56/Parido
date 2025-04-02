export interface Player {
  id: string;
  name: string;
  socketId: string;
  hand: number[];
}

export interface Bid {
  quantity: number;
  value: number;
}

export type GameStatus = "waiting" | "in_progress" | "finished";

export interface GameState {
  gameId: string | null;
  timestamp: string | null;
  maxPlayers: number;
  status: GameStatus;
  players: Player[];
  currentPlayerSocketId?: string;
  activePlayerSocketId?: string;
  currentBid?: Bid;
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

  public getPlayers(): Player[] {
    return this.state.players;
  }

  public getPlayerById(playerId: string): Player | undefined {
    return this.state.players.find((player) => player.id === playerId);
  }

  public setCurrentPlayerSocketId(socketId: string): void {
    this.setState({ currentPlayerSocketId: socketId });
  }

  public setActivePlayerSocketId(socketId: string): void {
    this.setState({ activePlayerSocketId: socketId });
  }

  public getCurrentPlayerSocketId(): string | undefined {
    return this.state.currentPlayerSocketId;
  }

  public getActivePlayerSocketId(): string | undefined {
    return this.state.activePlayerSocketId;
  }

  public isCurrentPlayerActive(): boolean {
    return this.state.currentPlayerSocketId === this.state.activePlayerSocketId;
  }

  public setCurrentBid(bid: Bid): void {
    this.setState({ currentBid: bid });
  }

  public canStart(): boolean {
    return this.state.status === "waiting" && this.state.players.length > 1;
  }
}

