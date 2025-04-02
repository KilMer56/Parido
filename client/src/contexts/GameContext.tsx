import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  createContext,
} from "react";
import { GameHandler } from "../events/GameHandler";
import { GameState, createInitialGameState } from "../types/game";

interface GameContextType {
  state: GameState;
  createGame: () => void;
  joinGame: (gameId: string) => void;
  startGame: (gameId: string) => void;
  isReady: boolean;
}

export const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>(createInitialGameState());
  const [isReady, setIsReady] = useState(false);

  const gameHandler = useRef<GameHandler | null>(null);

  // Initialize game handler once
  useEffect(() => {
    gameHandler.current = new GameHandler(setState);
    setIsReady(true);

    return () => {
      if (gameHandler.current) {
        gameHandler.current.cleanup();
        gameHandler.current = null;
      }
    };
  }, []);

  const createGame = useCallback(() => {
    if (!isReady || !gameHandler.current) return;
    gameHandler.current.createGame();
  }, [isReady]);

  const joinGame = useCallback(
    (gameId: string) => {
      if (!isReady || !gameHandler.current) return;
      gameHandler.current.joinGame(gameId);
    },
    [isReady]
  );

  const startGame = useCallback(
    (gameId: string) => {
      if (!isReady || !gameHandler.current) return;
      gameHandler.current.startGame(gameId);
    },
    [isReady]
  );

  return (
    <GameContext.Provider
      value={{
        state,
        createGame,
        joinGame,
        startGame,
        isReady,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = React.useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}

