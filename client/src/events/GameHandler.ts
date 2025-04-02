import { Socket } from "socket.io-client";
import { SocketEvent, SocketManager } from "./SocketManager";
import Logger from "../utils/logger";
import { Game, Player, Round } from "../models/Game";

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
            maxPlayers: number;
          };

          Logger.info("Game created:", game);

          this.game.setGameId(game.gameId);
          this.game.setState({ maxPlayers: game.maxPlayers });

          const socketId = this.socketManager.getSocket().id;
          if (socketId) {
            this.game.setPlayerSocketId(socketId);
          }
        },
      },
      {
        name: "playerJoined",
        handler: (_socket: Socket, ...args: unknown[]) => {
          const game = args[0] as {
            gameId: string;
            players: Player[];
            maxPlayers: number;
          };
          Logger.info("Game joined:", game);

          if (this.game.getGameId() === null) {
            this.game.setGameId(game.gameId);
            const socketId = this.socketManager.getSocket().id;
            if (socketId) {
              this.game.setPlayerSocketId(socketId);
            }
          }

          this.game.setPlayers(game.players);
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
            gameId: string;
            players: Player[];
            currentRound: Round;
          };

          Logger.info("Game started:", data);

          this.game.setPlayers(data.players);
          this.game.setStatus("in_progress");
          this.game.setCurrentRound(data.currentRound);
        },
      },
      {
        name: "bidPlaced",
        handler: (_socket: Socket, ...args: unknown[]) => {
          const data = args[0] as {
            gameId: string;
            currentRound: {
              activePlayerSocketId: string;
              lastBid: {
                playerId: string;
                quantity: number;
                value: number;
              };
            };
          };

          Logger.info("Bid placed:", data);

          const round = this.game.getCurrentRound();
          if (round) {
            round.activePlayerSocketId = data.currentRound.activePlayerSocketId;
            round.lastBid = data.currentRound.lastBid;
            this.game.setCurrentRound(round);
          }
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
    this.game.setState(Game.createInitialState());
  }

  public placeBid(quantity: number, value: number): void {
    Logger.info("Placing bid:", quantity, value);
    this.socketManager.emit("placeBid", this.game.getGameId(), quantity, value);
  }

  public challengeBid(): void {
    Logger.info("Challenging bid");
    this.socketManager.emit("challengeBid", this.game.getGameId());
  }
}

