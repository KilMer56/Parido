export type GameAction = {
  type: "create" | "join" | "start" | "leave" | "bid" | "challenge";
  payload?: unknown;
};

export const createGame = (username: string) => ({
  type: "create" as const,
  payload: { username: username },
});
export const joinGame = (gameId: string, username: string) => ({
  type: "join" as const,
  payload: {
    gameId: gameId,
    username: username,
  },
});
export const startGame = () => ({ type: "start" as const });
export const leaveGame = () => ({ type: "leave" as const });
export const bid = (quantity: number, value: number) => ({
  type: "bid" as const,
  payload: {
    quantity: quantity,
    value: value,
  },
});
export const challenge = () => ({ type: "challenge" as const });

