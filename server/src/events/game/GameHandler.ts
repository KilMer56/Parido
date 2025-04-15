import { Socket } from "socket.io";
import { gameManager } from "../../models/GameManager";
import Logger from "../../utils/logger";
import { BaseEventHandler, SocketEvent } from "../BasicHandler";
import { GameStatus } from "../../models/Game";
import { emitError } from "../../utils/socket";

class GameHandler extends BaseEventHandler {
  protected events: SocketEvent[] = [
    // Start Game
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
                    .to(player.getSocketId())
                    .emit("gameStarted", gameDataWithHands);
                }
              });
            } else {
              emitError(socket, new Error("Round not found"));
              Logger.error("Round not found:", gameId);
            }
          } else {
            emitError(
              socket,
              new Error(
                "Cannot start game: not enough players or game already started"
              )
            );
            Logger.error("Cannot start game:", gameId);
          }
        } else {
          emitError(socket, new Error("Game not found"));
          Logger.error("Game not found:", gameId);
        }
      },
    },

    // Place Bid
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
                      playerSocketId: game
                        .getCurrentRound()
                        ?.getLastBid()
                        ?.getPlayer()
                        .getSocketId(),
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
                emitError(socket, error);
                Logger.error("Bid error:", error);
              }
            } else {
              emitError(socket, new Error("Round not found"));
              Logger.error("Round not found:", gameId);
            }
          } else {
            emitError(socket, new Error("Player not found"));
            Logger.error("Player not found:", socket.id);
          }
        } else {
          emitError(socket, new Error("Game not found"));
          Logger.error("Game not found:", gameId);
        }
      },
    },

    // Challenge Bid
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
                // Run challenge
                const challenge = round.challengeBid(
                  player,
                  game.getActiveDices()
                );

                Logger.info("Challenge over:", challenge.getResult());

                // Send results
                let challengeData = {
                  gameId: game.getId(),
                  challengerSocketId: player.getSocketId(),
                  success: challenge.getResult(),
                  loserSocketId: round.getLoser()?.getSocketId(),
                };

                socket.emit("bidChallenged", challengeData);
                socket.to(gameId).emit("bidChallenged", challengeData);

                // End round
                game.endRound();

                if (game.getStatus() === GameStatus.ONGOING) {
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
                      socket.emit("newRoundStarted", gameDataWithHands);
                    } else {
                      socket
                        .to(player.getSocketId())
                        .emit("newRoundStarted", gameDataWithHands);
                    }
                  });
                } else {
                  const gameData = {
                    gameId: game.getId(),
                    status: game.getStatus(),
                    players: game.getPlayers().map((player) => ({
                      id: player.getId(),
                      name: player.getName(),
                      socketId: player.getSocketId(),
                      diceCount: player.getHand().length,
                    })),
                    rounds: game.getRounds().map((round) => ({
                      number: round.getNumber(),
                      state: round.getState(),
                      actions: round.getActions().map((action) => ({
                        id: action.getId(),
                        type: action.getType(),
                        playerId: action.getPlayer().getId(),
                        data: action.getData(),
                      })),
                    })),
                    winnerSocketId: game.getWinner()?.getSocketId(),
                  };

                  socket.to(gameId).emit("gameEnded", gameData);
                  socket.emit("gameEnded", gameData);
                }
              } catch (error) {
                emitError(socket, error);
                Logger.error("Challenge error:", error);
              }
            } else {
              emitError(socket, new Error("Round not found"));
              Logger.error("Round not found:", gameId);
            }
          } else {
            emitError(socket, new Error("Player not found"));
            Logger.error("Player not found:", socket.id);
          }
        } else {
          emitError(socket, new Error("Game not found"));
          Logger.error("Game not found:", gameId);
        }
      },
    },
  ];
}

export const gameHandler = new GameHandler();

