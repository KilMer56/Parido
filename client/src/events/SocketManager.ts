import { io, Socket } from "socket.io-client";
import Logger from "../utils/logger";

export interface SocketEvent {
  name: string;
  handler: (socket: Socket, ...args: unknown[]) => void;
}

export class SocketManager {
  private static instance: SocketManager;
  private socket: Socket;
  private registeredEvents: Map<string, SocketEvent[]> = new Map();
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
      // Remove any existing listeners for this event
      this.socket.off(event.name);
      
      // Add the new listener
      this.socket.on(event.name, (...args) =>
        event.handler(this.socket, ...args)
      );

      // Track the registered event
      if (!this.registeredEvents.has(event.name)) {
        this.registeredEvents.set(event.name, []);
      }
      this.registeredEvents.get(event.name)?.push(event);
    });
  }

  public unregisterEvents(events: SocketEvent[]): void {
    Logger.info(
      "Unregistering events:",
      events.map((e) => e.name)
    );

    events.forEach((event) => {
      // Remove the event from our tracking
      const registeredEvents = this.registeredEvents.get(event.name);
      if (registeredEvents) {
        const index = registeredEvents.findIndex(e => e === event);
        if (index !== -1) {
          registeredEvents.splice(index, 1);
        }
      }

      // If no more events for this name, remove the socket listener
      if (!this.registeredEvents.get(event.name)?.length) {
        this.socket.off(event.name);
        this.registeredEvents.delete(event.name);
      }
    });
  }

  public emit(event: string, ...args: unknown[]): void {
    this.socket.emit(event, ...args);
  }

  public getSocket(): Socket {
    return this.socket;
  }
}

