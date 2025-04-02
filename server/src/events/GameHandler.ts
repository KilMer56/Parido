import { Socket } from "socket.io";
import { gameManager } from "../models/GameManager";
import Logger from "../utils/logger";
import { BaseEventHandler, SocketEvent } from "./BasicHandler";
import { getCurrentDatetime } from "../utils/date";
import { Player } from "../models/Player";

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
          timestamp: getCurrentDatetime(),
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
          if (game.addPlayer(new Player(socket.id))) {
            socket.join(gameId);
            socket.emit("gameJoined", {
              gameId: game.getId(),
              timestamp: getCurrentDatetime(),
              players: game.getPlayers().map((player) => ({
                id: player.getId(),
                name: player.getName(),
                socketId: player.getSocketId(),
              })),
              maxPlayers: game.getMaxPlayers(),
            });

            // Notify all players about the new player
            game.getId() &&
              socket.to(game.getId()).emit("playerJoined", {
                players: game.getPlayers().map((player) => ({
                  id: player.getId(),
                  name: player.getName(),
                  socketId: player.getSocketId(),
                })),
                maxPlayers: game.getMaxPlayers(),
              });

            Logger.info("Player joined game:", gameId);
          } else {
            socket.emit("error", {
              message: "Game is full or has already started",
            });
            Logger.error("Game is full or has started:", gameId);
          }
        } else {
          socket.emit("error", { message: "Game not found" });
          Logger.error("Game not found:", gameId);
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
            const gameData = {
              timestamp: getCurrentDatetime(),
              players: game.getPlayers().map((player) => ({
                id: player.getId(),
                name: player.getName(),
                socketId: player.getSocketId(),
                dices: player.getDices().map(dice => dice.getValue())
              }))
            };
            game.getId() &&
              socket.to(game.getId()).emit("gameStarted", gameData);
            socket.emit("gameStarted", gameData);
            Logger.info("Game started:", gameId);
          } else {
            socket.emit("error", {
              message:
                "Cannot start game: not enough players or game already started",
            });
            Logger.error("Cannot start game:", gameId);
          }
        } else {
          socket.emit("error", { message: "Game not found" });
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
          const player = game
            .getPlayers()
            .find((p) => p.getSocketId() === socket.id);
          if (player) {
            game.removePlayer(player);

            // Notify other players about the player leaving
            socket.to(gameId).emit("playerLeft", {
              playerId: player.getId(),
              players: game.getPlayers().map((player) => ({
                id: player.getId(),
                name: player.getName(),
                socketId: player.getSocketId(),
              })),
              maxPlayers: game.getMaxPlayers(),
            });

            // If no players left, remove the game
            if (game.getPlayers().length === 0) {
              gameManager.removeGame(gameId);
            }

            Logger.info("Player left game:", gameId);
          }
        }
      },
    },
  ];
}

export const gameHandler = new GameHandler();

