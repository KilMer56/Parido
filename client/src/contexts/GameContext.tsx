import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  createContext,
} from "react";
import { GameHandler } from "../events/GameHandler";
import { GameState, createInitialGameState } from "../types/game";
import { GameAction } from "../types/actions";

interface GameContextType {
  state: GameState;
  dispatch: (action: GameAction) => void;
  isReady: boolean;
}

export const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>(createInitialGameState());
  const [isReady, setIsReady] = useState(false);
  const gameHandler = useRef<GameHandler | null>(null);

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

  const dispatch = useCallback(
    (action: GameAction) => {
      if (!isReady || !gameHandler.current) return;

      switch (action.type) {
        case "create":
          gameHandler.current.createGame();
          break;
        case "join":
          gameHandler.current.joinGame(action.payload);
          break;
        case "start":
          gameHandler.current.startGame(action.payload);
          break;
        case "leave":
          // Handle leave game logic
          break;
        case "update":
          setState((prev) => ({ ...prev, ...action.payload }));
          break;
      }
    },
    [isReady]
  );

  return (
    <GameContext.Provider
      value={{
        state,
        dispatch,
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

