export type GameAction = {
  type: "create" | "join" | "start" | "leave" | "bid" | "challenge";
  payload?: unknown;
};

export const createGame = () => ({ type: "create" as const });
export const joinGame = (gameId: string) => ({
  type: "join" as const,
  payload: gameId,
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

