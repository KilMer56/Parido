import { Socket } from "socket.io-client";
import { SocketEvent, SocketManager } from "./SocketManager";
import Logger from "../utils/logger";
import { Game, Player } from "../models/Game";

export class GameHandler {
  private socketManager: SocketManager;
  private events: SocketEvent[];
  private game: Game;

  constructor(game: Game) {
    this.socketManager = SocketManager.getInstance();
    this.game = game;

    this.events = [
      {
        name: "gameCreated",
        handler: (_socket: Socket, ...args: unknown[]) => {
          const game = args[0] as {
            gameId: string;
            timestamp: string;
            maxPlayers: number;
          };
          Logger.info("Game created:", game);

          this.game.setGameId(game.gameId);
          this.game.setTimestamp(game.timestamp);
          this.game.setState({ maxPlayers: game.maxPlayers });
          const socketId = this.socketManager.getSocket().id;
          if (socketId) {
            this.game.setCurrentPlayerSocketId(socketId);
          }
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

          this.game.setGameId(game.gameId);
          this.game.setTimestamp(game.timestamp);
          this.game.setPlayers(game.players);
          this.game.setState({ maxPlayers: game.maxPlayers });
          const socketId = this.socketManager.getSocket().id;
          if (socketId) {
            this.game.setCurrentPlayerSocketId(socketId);
          }
        },
      },
      {
        name: "playerJoined",
        handler: (_socket: Socket, ...args: unknown[]) => {
          const data = args[0] as { players: Player[]; maxPlayers: number };
          Logger.info("Player joined:", data);

          this.game.setPlayers(data.players);
          this.game.setState({ maxPlayers: data.maxPlayers });
        },
      },
      {
        name: "playerLeft",
        handler: (_socket: Socket, ...args: unknown[]) => {
          const data = args[0] as {
            playerId: number;
            players: Player[];
            maxPlayers: number;
          };
          Logger.info("Player left:", data);

          this.game.setPlayers(data.players);
        },
      },
      {
        name: "gameStarted",
        handler: (_socket: Socket, ...args: unknown[]) => {
          const data = args[0] as {
            timestamp: string;
            players: Player[];
          };
          Logger.info("Game started:", data);

          this.game.setTimestamp(data.timestamp);
          this.game.setPlayers(data.players);
          this.game.setStatus("in_progress");
        },
      },
      {
        name: "bidPlaced",
        handler: (_socket: Socket, ...args: unknown[]) => {
          const data = args[0] as {
            playerId: number;
            dieQuantity: number;
            dieValue: number;
            nextPlayerId: number;
          };

          Logger.info("Bid placed:", data);

          // const player = this.game.getPlayer(data.playerId);
          // if (player) {
          //   player.setBid(data.dieQuantity, data.dieValue);
          // }
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

  public startGame(): void {
    if (this.game.canStart()) {
      Logger.info("Starting game:", this.game.getGameId());
      this.socketManager.emit("startGame", this.game.getGameId());
    }
  }

  public leaveGame(): void {
    Logger.info("Leaving game");
    this.socketManager.emit("leaveGame", this.game.getGameId());
  }

  public placeBid(dieQuantity: number, dieQalue: number): void {
    Logger.info("Placing bid:", dieQuantity, dieQalue);
    this.socketManager.emit(
      "placeBid",
      this.game.getGameId(),
      dieQuantity,
      dieQalue
    );
  }
}

