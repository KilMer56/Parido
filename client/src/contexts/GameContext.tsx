import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  createContext,
} from "react";
import { GameHandler } from "../events/handlers/GameHandler";
import { GameState, Game } from "../models/Game";
import { GameAction } from "../types/actions";
import { useNotification } from "./NotificationContext";
import Logger from "../utils/logger";
import { useNavigate } from "react-router-dom";

interface GameContextType {
  state: GameState;
  dispatch: (action: GameAction) => void;
  isReady: boolean;
}

export const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const notificationContext = useNotification();
  const [state, setState] = useState<GameState>(Game.createInitialState());
  const [isReady, setIsReady] = useState(false);
  const gameHandler = useRef<GameHandler | null>(null);
  const game = useRef<Game | null>(null);

  useEffect(() => {
    game.current = new Game(setState);
    gameHandler.current = new GameHandler(game.current);
    gameHandler.current.setNotificationContext(notificationContext);
    gameHandler.current.setNavigate((path: string) => {
      navigate(path);
    });

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
        case "create": {
          const payload = action.payload as {
            username: string;
          };

          Logger.info("Creating game with username:", payload.username);

          gameHandler.current.createGame(payload.username);
          break;
        }
        case "join": {
          const payload = action.payload as {
            gameId: string;
            username: string;
          };

          gameHandler.current.joinGame(payload.gameId, payload.username);
          break;
        }
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

