import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  createContext,
} from "react";
import { GameHandler } from "../events/GameHandler";
import { useNavigate } from "react-router-dom";

export interface GameState {
  gameId: string | null;
  timestamp: string | null;
}

interface GameContextType {
  state: GameState;
  createGame: () => void;
  joinGame: (gameId: string) => void;
  isReady: boolean;
}

export const GameContext = createContext<GameContextType | null>(null);

export default function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>({
    gameId: null,
    timestamp: null,
  });
  const [isReady, setIsReady] = useState(false);

  // Single instance of game handler
  const gameHandler = useRef<GameHandler | null>(null);

  // Initialize game handler once
  useEffect(() => {
    // Create handler immediately
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

  const joinGame = useCallback((gameId: string) => {
    if (!isReady || !gameHandler.current) return;
    gameHandler.current.joinGame(gameId);
  }, [isReady]);

  return (
    <GameContext.Provider
      value={{
        state,
        createGame,
        joinGame,
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

