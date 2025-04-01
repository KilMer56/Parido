import React, { createContext, useContext, useState, useEffect } from "react";
import { GameHandler } from "../events/GameHandler";

interface GameState {
  gameId: string | null;
  timestamp: string | null;
}

interface GameContextType {
  state: GameState;
  createGame: () => void;
  joinGame: (gameId: string) => void;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>({
    gameId: null,
    timestamp: null,
  });

  // Initialize game handler
  const gameHandler = new GameHandler(setState);

  return (
    <GameContext.Provider
      value={{
        state,
        createGame: gameHandler.createGame.bind(gameHandler),
        joinGame: gameHandler.joinGame.bind(gameHandler),
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}

