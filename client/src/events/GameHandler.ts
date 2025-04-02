import { Socket } from "socket.io-client";
import { SocketEvent, SocketManager } from "./SocketManager";
import { Dispatch, SetStateAction } from "react";
import Logger from "../utils/logger";
import { GameState, Player } from "../types/game";

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
          const game = args[0] as { gameId: string; timestamp: string; maxPlayers: number };
          Logger.info("Game created:", game);

          this.updateGameState({
            gameId: game.gameId,
            timestamp: game.timestamp,
            maxPlayers: game.maxPlayers,
            players: [],
            status: 'waiting',
          });
        },
      },
      {
        name: "gameJoined",
        handler: (_socket: Socket, ...args: unknown[]) => {
          const game = args[0] as {
            gameId: string;
            timestamp: string;
            players: Player[];
            maxPlayers: number;
          };
          Logger.info("Game joined:", game);

          this.updateGameState({
            gameId: game.gameId,
            timestamp: game.timestamp,
            maxPlayers: game.maxPlayers,
            players: game.players,
            status: 'waiting',
          });
        },
      },
      {
        name: "playerJoined",
        handler: (_socket: Socket, ...args: unknown[]) => {
          const data = args[0] as { players: Player[]; maxPlayers: number };
          Logger.info("Player joined:", data);

          this.updateGameState((prev) => ({
            ...prev,
            players: data.players,
            maxPlayers: data.maxPlayers,
          }));
        },
      },
      {
        name: "gameStarted",
        handler: (_socket: Socket, ...args: unknown[]) => {
          const data = args[0] as { timestamp: string };
          Logger.info("Game started:", data);

          this.updateGameState((prev) => ({
            ...prev,
            isStarted: true,
            timestamp: data.timestamp,
            canStart: false,
          }));
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

  public startGame(gameId: string): void {
    Logger.info("Starting game:", gameId);
    this.socketManager.emit("startGame", gameId);
  }
}

