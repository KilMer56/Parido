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
              active: player.isActive(),
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
                active: player.isActive(),
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
                  active: player.isActive(),
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
      name: "disconnect",
      handler: (socket: Socket) => {
        Logger.info("User disconnected:", socket.id);

        const game = gameManager.getGameBySocketId(socket.id);
        if (game) {
          const player = game.getPlayerBySocketId(socket.id);
          if (player) {
            player.setActive(false); // Mark the player as inactive

            const playerDisconnectedData = {
              gameId: game.getId(),
              playerId: player.getId(),
            };

            socket
              .to(game.getId())
              .emit("playerDisconnected", playerDisconnectedData);
            Logger.info("Player marked as disconnected:", player.getId());
          }
        }
      },
    },
    {
      name: "reconnectToGame",
      handler: (socket: Socket, data: { gameId: string; username: string }) => {
        Logger.info("Reconnecting user to game:", data);

        const game = gameManager.getGame(data.gameId);
        if (game) {
          const player = game.getPlayerByName(data.username);
          if (player) {
            player.setActive(true);
            player.setSocketId(socket.id);

            socket.join(game.getId());

            const reconnectData = {
              gameId: game.getId(),
              players: game.getPlayers().map((player) => ({
                id: player.getId(),
                name: player.getName(),
                socketId: player.getSocketId(),
                active: player.isActive(),
              })),
              maxPlayers: game.getMaxPlayers(),
            };

            socket.emit("playerReconnected", reconnectData);
            socket.to(game.getId()).emit("playerReconnected", reconnectData);

            Logger.info("User reconnected to game:", data.gameId);
          } else {
            emitError(socket, new Error("Player not found"));
            Logger.error("Player not found for reconnection:", data);
          }
        } else {
          Logger.warn("Game not found for reconnection:", data.gameId);
          emitError(socket, new Error("Game not found"));
        }
      },
    },
  ];
}

export const lobbyHandler = new LobbyHandler();

