import { GameState, GameStatus, Player } from '../types/game';

export class Game {
  private state: GameState;
  private updateState: (state: GameState) => void;

  constructor(updateState: (state: GameState) => void) {
    this.updateState = updateState;
    this.state = {
      gameId: null,
      timestamp: null,
      maxPlayers: 2,
      status: 'waiting',
      players: [],
    };
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

  public setTimestamp(timestamp: string): void {
    this.setState({ timestamp });
  }

  public setStatus(status: GameStatus): void {
    this.setState({ status });
  }

  public setPlayers(players: Player[]): void {
    this.setState({ players });
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
    return this.state.status === 'waiting' && this.state.players.length > 1;
  }

  public isFull(): boolean {
    return this.state.players.length >= this.state.maxPlayers;
  }

  public hasStarted(): boolean {
    return this.state.status === 'in_progress';
  }

  public reset(): void {
    this.state = {
      gameId: null,
      timestamp: null,
      maxPlayers: 2,
      status: 'waiting',
      players: [],
    };
    this.updateState(this.state);
  }
} 