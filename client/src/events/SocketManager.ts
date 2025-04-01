import { io, Socket } from "socket.io-client";
import Logger from "../utils/logger";

export interface SocketEvent {
  name: string;
  handler: (socket: Socket, ...args: unknown[]) => void;
}

export class SocketManager {
  private static instance: SocketManager;
  private socket: Socket;
  public events: SocketEvent[] = [];
  private isConnected: boolean = false;
  private pendingEvents: SocketEvent[] = [];

  private constructor() {
    const SOCKET_URL =
      import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";
    Logger.info("Initializing SocketManager with URL:", SOCKET_URL);

    this.socket = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      path: "/socket.io/",
      transports: ["websocket", "polling"],
      withCredentials: true,
      timeout: 60000,
    });

    // Log all incoming events
    this.socket.onAny((event, ...args) => {
      Logger.debug(`[Socket Incoming] ${event}:`, args);
    });

    // Log all outgoing events
    this.socket.onAnyOutgoing((event, ...args) => {
      Logger.debug(`[Socket Outgoing] ${event}:`, args);
    });

    // Register basic events immediately
    this.setupBasicEvents();

    // If socket is already connected, set the connected state
    if (this.socket.connected) {
      Logger.info("Socket was already connected on initialization");
      this.isConnected = true;
    }
  }

  public static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  private setupBasicEvents(): void {
    const basicEvents: SocketEvent[] = [
      {
        name: "connect",
        handler: (socket) => {
          Logger.info("Connected to server:", socket.id);
          Logger.info("Transport:", socket.io.engine.transport.name);
          this.isConnected = true;
          // Register any pending events when connection is established
          if (this.pendingEvents.length > 0) {
            Logger.info("Registering pending events after connection");
            this.registerEvents(this.pendingEvents);
            this.pendingEvents = [];
          }
        },
      },
      {
        name: "disconnect",
        handler: () => {
          Logger.info("Disconnected from server");
          this.isConnected = false;
        },
      },
      {
        name: "connect_error",
        handler: (_socket, error) => {
          console.error("Connection error:", error);
          this.isConnected = false;
        },
      },
      {
        name: "error",
        handler: (_socket, error) => {
          console.error("Socket error:", error);
          this.isConnected = false;
        },
      },
    ];

    // Register basic events directly on the socket
    basicEvents.forEach((event) => {
      this.socket.on(event.name, (...args) =>
        event.handler(this.socket, ...args)
      );
    });
  }

  public registerEvents(events: SocketEvent[]): void {
    if (!this.isConnected) {
      Logger.info("Socket not connected, queuing events for registration");
      this.pendingEvents.push(...events);
      return;
    }
    events.forEach((event) => {
      this.socket.on(event.name, (...args) =>
        event.handler(this.socket, ...args)
      );
    });
    this.events.push(...events);
  }

  public unregisterEvents(events: SocketEvent[]): void {
    Logger.info(
      "Unregistering events:",
      events.map((e) => e.name)
    );
    events.forEach((event) => {
      this.socket.off(event.name);
    });
    this.events = this.events.filter(
      (e) => !events.some((event) => event.name === e.name)
    );
  }

  public emit(event: string, ...args: unknown[]): void {
    this.socket.emit(event, ...args);
  }

  public getSocket(): Socket {
    return this.socket;
  }
}

