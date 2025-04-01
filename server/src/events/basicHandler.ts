import { Socket } from "socket.io";
import Logger from "../utils/logger";

export interface EventHandler {
  registerEvents(socket: Socket): void;
}

export const basicHandler: EventHandler = {
  registerEvents: (socket: Socket) => {
    // Handle disconnection
    socket.on("disconnect", () => {
      Logger.info("Client disconnected:", socket.id);
    });

    // Handle errors
    socket.on("error", (error) => {
      Logger.error("Socket error:", error);
    });

    // Handle connection errors
    socket.on("connect_error", (error) => {
      Logger.error("Connection error:", error);
    });

    // Handle ping and pong events
    socket.on("ping", () => {
      Logger.debug("Ping received from client:", socket.id);
    });

    socket.on("pong", () => {
      Logger.debug("Pong received from client:", socket.id);
    });
  },
};

