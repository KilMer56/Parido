import { Socket } from "socket.io";
import Logger from "../utils/logger";

export interface EventHandler {
  registerEvents(socket: Socket): void;
}

export interface SocketEvent {
  name: string;
  handler: (socket: Socket, ...args: any[]) => void;
}

export class BaseEventHandler implements EventHandler {
  protected events: SocketEvent[] = [];

  public registerEvents(socket: Socket): void {
    this.events.forEach((event) => {
      socket.on(event.name, (...args) => event.handler(socket, ...args));
    });
  }
}

class BasicHandler extends BaseEventHandler {
  protected events: SocketEvent[] = [
    {
      name: "disconnect",
      handler: (socket: Socket) => {
        Logger.info("Client disconnected:", socket.id);
      },
    },
    {
      name: "error",
      handler: (_socket: Socket, error: Error) => {
        Logger.error("Socket error:", error);
      },
    },
    {
      name: "connect_error",
      handler: (_socket: Socket, error: Error) => {
        Logger.error("Connection error:", error);
      },
    },
    {
      name: "ping",
      handler: (socket: Socket) => {
        Logger.debug("Ping received from client:", socket.id);
      },
    },
    {
      name: "pong",
      handler: (socket: Socket) => {
        Logger.debug("Pong received from client:", socket.id);
      },
    },
  ];
}

export const basicHandler = new BasicHandler();

