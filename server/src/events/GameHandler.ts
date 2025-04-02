import { Socket } from "socket.io";
import { gameManager } from "../models/GameManager";
import Logger from "../utils/logger";
import { BaseEventHandler, SocketEvent } from "./BasicHandler";
import { getCurrentDatetime } from "../utils/date";
import { Player } from "../models/Player";
import { Round, RoundState } from "../models/Round";
import { Game } from "../models/Game";
import { Bid } from "../models/actions/Bid";
import { Action } from "../models/actions/Action";
import e from "express";

class GameHandler extends BaseEventHandler {
  protected events: SocketEvent[] = [
    {
      name: "createGame",
      handler: (socket: Socket) => {
        Logger.info("Client creating game");

        const game = gameManager.createGame();
        socket.join(game.getId());

        socket.emit("gameCreated", {
          gameId: game.getId(),
          maxPlayers: game.getMaxPlayers(),
        });

        Logger.info("Game created:", game.getId());
      },
    },
    {
      name: "joinGame",
      handler: (socket: Socket, gameId: string) => {
        Logger.info("Client joining game:", gameId);

        const game = gameManager.getGame(gameId);
        if (game) {
          // Todo: pass name
          if (game.addPlayer(new Player(socket.id, "Guest"))) {
            socket.join(gameId);

            const playerJoinedData = {
              gameId: game.getId(),
              players: game.getPlayers().map((player) => ({
                id: player.getId(),
                name: player.getName(),
                socketId: player.getSocketId(),
              })),
            };

            // Notify all players about the new player
            socket.emit("playerJoined", playerJoinedData);
            socket.to(game.getId()).emit("playerJoined", playerJoinedData);

            Logger.info("Player joined game:", gameId);
          } else {
            this.emitError(
              socket,
              new Error("Game is full or has already started")
            );
            Logger.error("Game is full or has started:", gameId);
          }
        } else {
          this.emitError(socket, new Error("Game not found"));
          Logger.error("Game not found:", gameId);
        }
      },
    },
    {
      name: "leaveGame",
      handler: (socket: Socket, gameId: string) => {
        Logger.info("Client leaving game:", gameId);

        const game = gameManager.getGame(gameId);
        if (game) {
          // Remove the player from the game
          const player = game.getPlayerBySocketId(socket.id);
          if (player) {
            game.removePlayer(player);

            Logger.info("Player left game:", gameId);

            if (game.getPlayers().length === 0) {
              gameManager.removeGame(gameId);
            } else {
              const playerLeftData = {
                gameId: game.getId(),
                players: game.getPlayers().map((player) => ({
                  id: player.getId(),
                  name: player.getName(),
                  socketId: player.getSocketId(),
                })),
              };

              // Notify all players about the player leaving
              socket.to(game.getId()).emit("playerLeft", playerLeftData);
              socket.leave(gameId);
            }
          }
        }
      },
    },
    {
      name: "startGame",
      handler: (socket: Socket, gameId: string) => {
        Logger.info("Client requesting to start game:", gameId);

        const game = gameManager.getGame(gameId);
        if (game) {
          if (game.start()) {
            Logger.info("Game started:", gameId);

            if (game.getCurrentRound()) {
              let gameData = {
                gameId: game.getId(),
                players: game.getPlayers().map((player) => ({
                  id: player.getId(),
                  name: player.getName(),
                  socketId: player.getSocketId(),
                  diceCount: player.getHand().length,
                })),
                currentRound: {
                  number: game.getCurrentRound()?.getNumber(),
                  state: game.getCurrentRound()?.getState(),
                  activePlayerSocketId: game
                    .getCurrentRound()
                    ?.getActivePlayer()
                    .getSocketId(),
                  lastBid: null,
                },
              };

              // Notify all players with their hand
              game.getPlayers().forEach((player) => {
                const gameDataWithHands = {
                  ...gameData,
                  currentRound: {
                    ...gameData.currentRound,
                    hand: player.getHand(),
                  },
                };

                if (player.getSocketId() === socket.id) {
                  socket.emit("gameStarted", gameDataWithHands);
                } else {
                  socket
                    .to(game.getId())
                    .to(player.getSocketId())
                    .emit("gameStarted", gameDataWithHands);
                }
              });
            } else {
              this.emitError(socket, new Error("Round not found"));
              Logger.error("Round not found:", gameId);
            }
          } else {
            this.emitError(
              socket,
              new Error(
                "Cannot start game: not enough players or game already started"
              )
            );
            Logger.error("Cannot start game:", gameId);
          }
        } else {
          this.emitError(socket, new Error("Game not found"));
          Logger.error("Game not found:", gameId);
        }
      },
    },
    {
      name: "placeBid",
      handler: (
        socket: Socket,
        gameId: string,
        quantity: number,
        value: number
      ) => {
        Logger.info("Client bidding in game:", gameId);

        const game = gameManager.getGame(gameId);
        if (game) {
          const player = game.getPlayerBySocketId(socket.id);
          if (player) {
            const round = game.getCurrentRound();
            if (round) {
              try {
                round.placeBid(player, quantity, value);
                const nextPlayer = game.getNextPlayer(player);
                round.setActivePlayer(nextPlayer);

                Logger.info("Bid placed:", player.getName(), quantity, value);

                const bidData = {
                  gameId: game.getId(),
                  currentRound: {
                    activePlayerSocketId: game
                      .getCurrentRound()
                      ?.getActivePlayer()
                      .getSocketId(),
                    lastBid: {
                      playerId: game
                        .getCurrentRound()
                        ?.getLastBid()
                        ?.getPlayer()
                        .getId(),
                      quantity: game
                        .getCurrentRound()
                        ?.getLastBid()
                        ?.getQuantity(),
                      value: game.getCurrentRound()?.getLastBid()?.getValue(),
                    },
                  },
                };

                socket.to(gameId).emit("bidPlaced", bidData);
                socket.emit("bidPlaced", bidData);
              } catch (error) {
                this.emitError(socket, error);
                Logger.error("Bid error:", error);
              }
            } else {
              this.emitError(socket, new Error("Round not found"));
              Logger.error("Round not found:", gameId);
            }
          } else {
            this.emitError(socket, new Error("Player not found"));
            Logger.error("Player not found:", socket.id);
          }
        } else {
          this.emitError(socket, new Error("Game not found"));
          Logger.error("Game not found:", gameId);
        }
      },
    },
    {
      name: "challengeBid",
      handler: (socket: Socket, gameId: string) => {
        Logger.info("Client challenging bid for: ", gameId);

        const game = gameManager.getGame(gameId);
        if (game) {
          const player = game.getPlayerBySocketId(socket.id);
          if (player) {
            const round = game.getCurrentRound();
            if (round) {
              try {
                const challenge = round.challengeBid(
                  player,
                  game.getActiveDices()
                );

                Logger.info("Challenge over:", challenge);

                const loser = round.getLoser();
                game.endRound();

                const newRoundData = {
                  players: game.getPlayers().map((player) => ({
                    id: player.getId(),
                    name: player.getName(),
                    socketId: player.getSocketId(),
                    hand: player.getHand(),
                  })),
                  loserId: loser?.getId(),
                  winnerId: challenge.winner.getId(),
                };
              } catch (error) {
                this.emitError(socket, error);
                Logger.error("Challenge error:", error);
              }
            } else {
              this.emitError(socket, new Error("Round not found"));
              Logger.error("Round not found:", gameId);
            }
          } else {
            this.emitError(socket, new Error("Player not found"));
            Logger.error("Player not found:", socket.id);
          }
        } else {
          this.emitError(socket, new Error("Game not found"));
          Logger.error("Game not found:", gameId);
        }
      },
    },
  ];

  private emitError(socket: Socket, error: unknown) {
    if (error instanceof Error) {
      socket.emit("error", { name: error.name, message: error.message });
    } else {
      socket.emit("error", { message: "An unknown error occurred" });
    }
  }

  private buildPlayerSocketData(player: Player) {
    return {
      id: player.getId(),
      name: player.getName(),
      hand: player.getHand(),
      isActive: player.isActive(),
    };
  }

  private buildActionSocketData(action: Action) {
    return {
      id: action.getId(),
      type: action.getType(),
      playerId: action.getPlayer().getId(),
      data: action.getData(),
    };
  }

  private buildRoundSocketData(round: Round) {
    return {
      state: round.getState(),
      actions: round
        .getActions()
        .map((action) => this.buildActionSocketData(action)),
      lastBid: round.getLastBid(),
      loser: round.getLoser()?.getId(),
    };
  }

  private buildGameData(game: Game) {
    return {
      players: game.getPlayers().map((player) => ({
        id: player.getId(),
        name: player.getName(),
        hand: player.getHand(),
        isActive: player.isActive(),
      })),
      rounds: game.getRounds().map((round) => ({
        state: round.getState(),
        actions: round.getActions().map((action) => ({
          id: action.getId(),
          type: action.getType(),
          playerId: action.getPlayer().getId(),
          data: action.getData(),
        })),
      })),
      currentPlayerSocketId: game
        .getCurrentRound()
        ?.getActivePlayer()
        .getSocketId(),
    };
  }
}

export const gameHandler = new GameHandler();

