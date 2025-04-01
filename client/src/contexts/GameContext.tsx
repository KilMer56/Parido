import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  createContext,
} from "react";
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

  // Use useRef to maintain a single instance of the game handler
  const gameHandlerRef = useRef<GameHandler | null>(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    // Initialize game handler only once, even in strict mode
    if (!isInitializedRef.current) {
      gameHandlerRef.current = new GameHandler(setState);
      isInitializedRef.current = true;
    }

    // Cleanup on unmount
    return () => {
      if (gameHandlerRef.current) {
        gameHandlerRef.current.cleanup();
        gameHandlerRef.current = null;
        isInitializedRef.current = false;
      }
    };
  }, []); // Empty dependency array means this runs once on mount

  // Create stable handler functions with useCallback
  const createGame = useCallback(() => {
    if (gameHandlerRef.current) {
      gameHandlerRef.current.createGame();
    }
  }, []);

  const joinGame = useCallback((gameId: string) => {
    if (gameHandlerRef.current) {
      gameHandlerRef.current.joinGame(gameId);
    }
  }, []);

  return (
    <GameContext.Provider
      value={{
        state,
        createGame,
        joinGame,
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

