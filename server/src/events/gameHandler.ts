import { Socket } from "socket.io";
import { gameManager } from "../models/gameManager";
import Logger from "../utils/logger";
import { BaseEventHandler, SocketEvent } from "./basicHandler";
import { getCurrentDatetime } from "../utils/date";

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
          socket.join(gameId);
          socket.emit("gameJoined", {
            gameId: game.getId(),
            timestamp: getCurrentDatetime(),
          });
          Logger.info("Player joined game:", gameId);
        } else {
          socket.emit("error", { message: "Game not found" });
          Logger.error("Game not found:", gameId);
        }
      },
    },
  ];
}

export const gameHandler = new GameHandler();

