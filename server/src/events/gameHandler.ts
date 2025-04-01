import { Socket } from "socket.io";
import { gameManager } from "../models/gameManager";
import Logger from "../utils/logger";
import { EventHandler } from "./basicHandler";

export const gameHandler: EventHandler = {
  registerEvents: (socket: Socket) => {
    socket.on("createGame", () => {
      Logger.info("Client creating game");

      const game = gameManager.createGame();
      socket.join(game.getId());

      socket.emit("gameCreated", {
        gameId: game.getId(),
        timestamp: new Date().toISOString(),
      });

      Logger.info("Game created:", game.getId());
    });
  },
};

