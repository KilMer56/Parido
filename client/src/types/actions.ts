export type GameAction = {
  type: "create" | "join" | "start" | "leave" | "placeBid";
  payload?: unknown;
};

export const createGame = () => ({ type: "create" as const });
export const joinGame = (gameId: string) => ({
  type: "join" as const,
  payload: gameId,
});
export const startGame = () => ({ type: "start" as const });
export const leaveGame = () => ({ type: "leave" as const });
export const placeBid = (dieQuantity: number, dieValue: number) => ({
  type: "placeBid" as const,
  payload: {
    dieQuantity,
    dieValue,
  },
});

