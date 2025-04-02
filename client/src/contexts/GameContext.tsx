import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  createContext,
} from "react";
import { GameHandler } from "../events/GameHandler";
import { GameState, Game } from "../models/Game";
import { GameAction } from "../types/actions";

interface GameContextType {
  state: GameState;
  dispatch: (action: GameAction) => void;
  isReady: boolean;
}

export const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>(Game.createInitialState());
  const [isReady, setIsReady] = useState(false);
  const gameHandler = useRef<GameHandler | null>(null);
  const game = useRef<Game | null>(null);

  useEffect(() => {
    game.current = new Game(setState);
    gameHandler.current = new GameHandler(game.current);
    setIsReady(true);

    return () => {
      if (gameHandler.current) {
        gameHandler.current.cleanup();
        gameHandler.current = null;
      }
      game.current = null;
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
          gameHandler.current.joinGame(action.payload as string);
          break;
        case "start":
          gameHandler.current.startGame();
          break;
        case "leave":
          gameHandler.current.leaveGame();
          break;
        case "bid": {
          const payload = action.payload as {
            quantity: number;
            value: number;
          };

          gameHandler.current.placeBid(payload.quantity, payload.value);
          break;
        }
        case "challenge":
          gameHandler.current.challengeBid();
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

