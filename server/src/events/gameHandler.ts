import { Socket } from "socket.io";
import { gameManager } from "../models/gameManager";
import Logger from "../utils/logger";
import { BaseEventHandler, SocketEvent } from "./basicHandler";

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
          timestamp: new Date().toISOString(),
        });

        Logger.info("Game created:", game.getId());
      },
    },
  ];
}

export const gameHandler = new GameHandler();

