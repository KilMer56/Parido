import { Socket } from "socket.io-client";
import { SocketEvent, SocketManager } from "./SocketManager";
import { Dispatch, SetStateAction } from "react";
import Logger from "../utils/logger";

interface GameState {
  gameId: string | null;
  timestamp: string | null;
}

export class GameHandler {
  private socketManager: SocketManager;
  private events: SocketEvent[];
  private updateGameState: Dispatch<SetStateAction<GameState>>;

  constructor(updateGameState: Dispatch<SetStateAction<GameState>>) {
    this.socketManager = SocketManager.getInstance();
    this.updateGameState = updateGameState;

    this.events = [
      {
        name: "gameCreated",
        handler: (_socket: Socket, ...args: unknown[]) => {
          const game = args[0] as { gameId: string; timestamp: string };
          Logger.info("Game created:", game);

          this.updateGameState({
            gameId: game.gameId,
            timestamp: game.timestamp,
          });
        },
      },
      {
        name: "gameJoined",
        handler: (_socket: Socket, ...args: unknown[]) => {
          const game = args[0] as { gameId: string; timestamp: string };
          Logger.info("Game joined:", game);

          this.updateGameState({
            gameId: game.gameId,
            timestamp: game.timestamp,
          });
        },
      },
    ];

    this.socketManager.registerEvents(this.events);
  }

  public cleanup(): void {
    this.socketManager.unregisterEvents(this.events);
  }

  public createGame(): void {
    Logger.info("Creating game");
    this.socketManager.emit("createGame");
  }

  public joinGame(gameId: string): void {
    Logger.info("Joining game:", gameId);
    this.socketManager.emit("joinGame", gameId);
  }
}

