import { Socket } from "socket.io";
import { gameManager } from "../../models/GameManager";
import Logger from "../../utils/logger";
import { BaseEventHandler, SocketEvent } from "../BasicHandler";
import { Player } from "../../models/Player";
import { emitError } from "../../utils/socket";

class LobbyHandler extends BaseEventHandler {
  protected events: SocketEvent[] = [
    {
      name: "createGame",
      handler: (socket: Socket, username: string) => {
        Logger.info("Client creating game", username);

        const game = gameManager.createGame();
        if (game.addPlayer(new Player(socket.id, username))) {
          socket.join(game.getId());

          socket.emit("gameCreated", {
            gameId: game.getId(),
            maxPlayers: game.getMaxPlayers(),
          });

          socket.emit("gameJoined", {
            gameId: game.getId(),
            players: game.getPlayers().map((player) => ({
              id: player.getId(),
              name: player.getName(),
              socketId: player.getSocketId(),
            })),
            maxPlayers: game.getMaxPlayers(),
          });

          Logger.info("Game created & joined:", game.getId());
        } else {
          emitError(socket, new Error("Game is full or has already started"));
          Logger.error("Game is full or has started:", game.getId());
        }
      },
    },
    {
      name: "joinGame",
      handler: (socket: Socket, gameId: string, username: string) => {
        Logger.info("Client joining game:", gameId, username);

        const game = gameManager.getGame(gameId);
        if (game) {
          if (game.addPlayer(new Player(socket.id, username))) {
            socket.join(gameId);

            const playerJoinedData = {
              gameId: game.getId(),
              players: game.getPlayers().map((player) => ({
                id: player.getId(),
                name: player.getName(),
                socketId: player.getSocketId(),
              })),
              maxPlayers: game.getMaxPlayers(),
            };

            // Notify all players about the new player
            socket.emit("gameJoined", playerJoinedData);
            socket.to(game.getId()).emit("playerJoined", playerJoinedData);

            Logger.info("Player joined game:", gameId);
          } else {
            emitError(socket, new Error("Game is full or has already started"));
            Logger.error("Game is full or has started:", gameId);
          }
        } else {
          emitError(socket, new Error("Game not found"));
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
  ];
}

export const lobbyHandler = new LobbyHandler();

