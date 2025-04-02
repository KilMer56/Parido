export type GameAction = {
  type: "create" | "join" | "start" | "leave" | "update";
  payload?: unknown;
};

export const createGame = () => ({ type: "create" as const });
export const joinGame = (gameId: string) => ({
  type: "join" as const,
  payload: gameId,
});
export const startGame = (gameId: string) => ({
  type: "start" as const,
  payload: gameId,
});
export const leaveGame = () => ({ type: "leave" as const });

