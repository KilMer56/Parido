export interface Player {
  id: string;
  name: string;
  socketId: string;
  diceCount?: number;
}

export interface Round {
  number: number;
  state: string;
  activePlayerSocketId: string;
  hand: number[];
  lastBid?: Bid | null;
}

export interface Bid {
  playerId: string;
  quantity: number;
  value: number;
}

export type GameStatus = "waiting" | "in_progress" | "finished";

export interface GameState {
  gameId: string | null;
  status: GameStatus;
  maxPlayers: number;
  players: Player[];
  currentRound?: Round | null;
  playerSocketId?: string;
}

export class Game {
  private state: GameState;
  private updateState: (state: GameState) => void;

  public static createInitialState(): GameState {
    return {
      gameId: null,
      status: "waiting",
      maxPlayers: 2,
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

  public setStatus(status: GameStatus): void {
    this.setState({ status });
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
    return this.state.players;
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
}

