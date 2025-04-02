export interface Player {
  id: string;
  name: string;
}

export type GameStatus = 'waiting' | 'in_progress' | 'finished';

export interface GameState {
  gameId: string | null;
  timestamp: string | null;
  maxPlayers: number;
  status: GameStatus;
  players: Player[];
}

export const createInitialGameState = (): GameState => ({
  gameId: null,
  timestamp: null,
  maxPlayers: 2,
  status: 'waiting',
  players: [],
});

export const canStartGame = (state: GameState): boolean => {
  return state.status === 'waiting' && state.players.length > 1;
};

export const getPlayerCountText = (state: GameState): string => {
  return `Waiting for players (${state.players.length}/${state.maxPlayers})`;
};

export const getStatusText = (state: GameState): string => {
  return state.status === 'in_progress' ? 'Game in progress' : getPlayerCountText(state);
}; 