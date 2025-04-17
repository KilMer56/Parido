import { Socket } from "socket.io-client";
import { SocketEvent, SocketManager } from "../SocketManager";
import Logger from "../../utils/logger";
import { Game, Player, Round } from "../../models/Game";
import { NotificationContextType } from "../../contexts/NotificationContext";

export class GameHandler {
  private socketManager: SocketManager;
  private events: SocketEvent[];
  private game: Game;
  private notificationContext: NotificationContextType | null = null;
  private navigate?: (path: string) => void;

  constructor(game: Game) {
    this.socketManager = SocketManager.getInstance();
    this.game = game;

    this.events = [
      // Game is created
      {
        name: "gameCreated",
        handler: (_socket: Socket, ...args: unknown[]) => {
          const game = args[0] as {
            gameId: string;
            maxPlayers: number;
          };

          Logger.info("Game created:", game);
          this.showNotification("Game created", "info");

          this.game.setGameId(game.gameId);
          this.game.setState({ maxPlayers: game.maxPlayers });

          const socketId = this.socketManager.getSocket().id;
          if (socketId) {
            this.game.setPlayerSocketId(socketId);
          }
        },
      },
      // Game joined
      {
        name: "gameJoined",
        handler: (_socket: Socket, ...args: unknown[]) => {
          const game = args[0] as {
            gameId: string;
            players: Player[];
            maxPlayers: number;
          };

          const socketId = this.socketManager.getSocket().id;
          if (socketId) {
            this.game.setPlayerSocketId(socketId);
          }

          const username =
            game.players.find(
              (p) => p.socketId === this.game.getPlayerSocketId()
            )?.name || "";

          if (!username) {
            Logger.error("Username not found in players list");
            this.showNotification("Username not found", "error");
            return;
          }

          localStorage.setItem("gameId", game.gameId);
          localStorage.setItem("username", username);

          Logger.info("Game joined:", game);
          this.showNotification("Game joined", "info");

          this.game.setGameId(game.gameId);
          this.game.setUsername(username);
          this.game.setState({ maxPlayers: game.maxPlayers });
          this.game.setPlayers(game.players);

          if (this.navigate) {
            this.navigate("/game/" + game.gameId);
          }
        },
      },
      // Player joined
      {
        name: "playerJoined",
        handler: (_socket: Socket, ...args: unknown[]) => {
          const game = args[0] as {
            gameId: string;
            players: Player[];
            maxPlayers: number;
          };
          Logger.info("Game joined:", game);
          this.showNotification("New player joined", "info");
          this.game.setPlayers(game.players);
        },
      },
      // Player left
      {
        name: "playerLeft",
        handler: (_socket: Socket, ...args: unknown[]) => {
          const data = args[0] as {
            playerId: number;
            players: Player[];
            maxPlayers: number;
          };
          Logger.info("Player left:", data);
          this.showNotification("A player left", "info");

          this.game.setPlayers(data.players);
        },
      },
      // Game started
      {
        name: "gameStarted",
        handler: (_socket: Socket, ...args: unknown[]) => {
          const data = args[0] as {
            gameId: string;
            players: Player[];
            currentRound: Round;
          };

          Logger.info("Game started:", data);
          this.showNotification("Game started!", "info");

          this.game.setPlayers(data.players);
          this.game.setStatus("in_progress");
          this.game.setCurrentRound(data.currentRound);
        },
      },
      // Bid just got placed
      {
        name: "bidPlaced",
        handler: (socket: Socket, ...args: unknown[]) => {
          const data = args[0] as {
            gameId: string;
            currentRound: {
              activePlayerSocketId: string;
              lastBid: {
                playerSocketId: string;
                quantity: number;
                value: number;
              };
            };
          };

          Logger.info("Bid placed:", data);
          Logger.debug("Socket Id:", socket.id || "");

          if (data.currentRound.lastBid?.playerSocketId == socket.id) {
            this.showNotification("Your bid has been place", "success");
          } else {
            this.showNotification("A new bid has been placed", "info");
          }

          const round = this.game.getCurrentRound();
          if (round) {
            round.activePlayerSocketId = data.currentRound.activePlayerSocketId;
            round.lastBid = data.currentRound.lastBid;
            this.game.setCurrentRound(round);
          }
        },
      },
      {
        name: "bidChallenged",
        handler: (socket: Socket, ...args: unknown[]) => {
          const data = args[0] as {
            gameId: string;
            challengerSocketId: string;
            success: boolean;
            loserSocketId: string;
          };

          Logger.info("Bid challenged:", data);

          if (data.challengerSocketId == socket.id) {
            if (data.success) {
              this.showNotification("Your challenge succeeded!", "success");
            } else {
              this.showNotification(
                "Your challenge failed, you loose a dice",
                "error"
              );
            }
          } else if (data.loserSocketId == socket.id) {
            if (data.success) {
              this.showNotification(
                "Your bid got challenged, you loose a dice",
                "error"
              );
            } else {
              this.showNotification("Your bid passed!", "success");
            }
          } else {
            this.showNotification(
              "The current bid has been challenged!",
              "info"
            );
          }
        },
      },
      // New round started
      {
        name: "newRoundStarted",
        handler: (_socket: Socket, ...args: unknown[]) => {
          const data = args[0] as {
            gameId: string;
            players: Player[];
            currentRound: Round;
          };

          Logger.info("New round started:", data);
          this.showNotification("New round started", "info");

          this.game.setPlayers(data.players);
          this.game.setCurrentRound(data.currentRound);
        },
      },
      // Game ended
      {
        name: "gameEnded",
        handler: (socket: Socket, ...args: unknown[]) => {
          const data = args[0] as {
            gameId: string;
            players: Player[];
            rounds: Round[];
            winnerSocketId: string;
          };

          Logger.info("Game ended:", data);

          this.game.setStatus("finished");
          this.game.setPlayers(data.players);
          this.game.setLogs(data.rounds);
          this.game.setWinnerSocketId(data.winnerSocketId);

          if (data.winnerSocketId === socket.id) {
            this.showNotification("You've won the game, congrats!", "success");
          } else {
            this.showNotification("The game ended, we have a winner!", "info");
          }
        },
      },
    ];

    this.socketManager.registerEvents(this.events);
  }

  public setNotificationContext(context: NotificationContextType): void {
    this.notificationContext = context;
  }

  private showNotification(
    message: string,
    type: "error" | "success" | "info"
  ): void {
    if (this.notificationContext) {
      this.notificationContext.addNotification(message, type);
    }
  }

  public setNavigate(navigate: (path: string) => void): void {
    this.navigate = navigate;
  }

  public cleanup(): void {
    this.socketManager.unregisterEvents(this.events);
  }

  public createGame(username: string): void {
    Logger.info("Creating game", username);
    this.socketManager.emit("createGame", username);
  }

  public joinGame(gameId: string, username: string): void {
    Logger.info("Joining game:", gameId, username);
    this.socketManager.emit("joinGame", gameId, username);
  }

  public leaveGame(): void {
    Logger.info("Leaving game");
    this.socketManager.emit("leaveGame", this.game.getGameId());
    this.game.setState(Game.createInitialState());
    // Todo move to response
    localStorage.removeItem("gameId");
    localStorage.removeItem("username");
  }

  public startGame(): void {
    if (this.game.canStart()) {
      Logger.info("Starting game:", this.game.getGameId());
      this.socketManager.emit("startGame", this.game.getGameId());
    }
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

