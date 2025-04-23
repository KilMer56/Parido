import { io, Socket } from "socket.io-client";
import Logger from "../utils/logger";
import { NotificationContextType } from "../contexts/NotificationContext";
import { SOCKET_URL } from "../constants";
import axios from "axios";

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
  private notificationContext: NotificationContextType | null = null;
  private navigate: ((path: string) => void) | null = null;

  private constructor() {
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

    const storedGameId = localStorage.getItem("gameId");
    const storedUsername = localStorage.getItem("username");

    if (storedGameId && storedUsername) {
      Logger.info("Reconnecting to game:", storedGameId);
      this.socket.emit("reconnectToGame", {
        gameId: storedGameId,
        username: storedUsername,
      });
    }
  }

  public static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  public setNotificationContext(context: NotificationContextType): void {
    this.notificationContext = context;
  }

  public setNavigate(navigate: (path: string) => void): void {
    this.navigate = navigate;
  }

  private showNotification(
    message: string,
    type: "error" | "success" | "info"
  ): void {
    if (this.notificationContext) {
      this.notificationContext.addNotification(message, type);
    }
  }

  private setupBasicEvents(): void {
    const basicEvents: SocketEvent[] = [
      {
        name: "connect",
        handler: (socket) => {
          Logger.info("Connected to server:", socket.id);
          Logger.info("Transport:", socket.io.engine.transport.name);
          this.isConnected = true;
          this.showNotification("Connected to server", "success");
          // Register any pending events when connection is established
          if (this.pendingEvents.length > 0) {
            Logger.info("Registering pending events after connection");
            this.registerEvents(this.pendingEvents);
            this.pendingEvents = [];
          }

          // Check if the user has a gameId and username stored in local storage
          const storedGameId = localStorage.getItem("gameId");
          const storedUsername = localStorage.getItem("username");

          if (storedGameId && storedUsername) {
            Logger.info("Stored gameId and username found in local storage");
            // Check if the game exists
            axios
              .get(`${SOCKET_URL}/game/${storedGameId}`)
              .then((response) => {
                if (response.status === 200) {
                  Logger.info(
                    "Game exists, redirecting to game page:",
                    storedGameId
                  );

                  Logger.info("Reconnecting to game:", storedGameId);
                  this.socket.emit("reconnectToGame", {
                    gameId: storedGameId,
                    username: storedUsername,
                  });
                }
              })
              .catch((error) => {
                if (
                  axios.isAxiosError(error) &&
                  error.response?.status === 404
                ) {
                  Logger.error(
                    "Game not found (404), clearing local storage:",
                    error
                  );
                } else {
                  Logger.error("Error checking game existence:", error);
                }

                // Clear local storage if the game is not found
                localStorage.removeItem("gameId");
                localStorage.removeItem("username");

                this.showNotification(
                  "Game not found. Please create or join a new game.",
                  "error"
                );

                // Redirect to home page
                if (this.navigate) {
                  this.navigate("/");
                }
              });
          }
        },
      },
      {
        name: "disconnect",
        handler: () => {
          Logger.info("Disconnected from server");
          this.isConnected = false;
          this.showNotification("Disconnected from server", "error");
        },
      },
      {
        name: "connect_error",
        handler: (_socket, error) => {
          console.error("Connection error:", error);
          this.isConnected = false;
          this.showNotification("Connection error", "error");
        },
      },
      {
        name: "error",
        handler: (_socket, error) => {
          console.error("Socket error:", error);
          if (
            error &&
            typeof error === "object" &&
            "message" in error &&
            typeof error.message === "string"
          ) {
            this.showNotification(error.message, "error");
          } else {
            this.showNotification("An unknown error occurred", "error");
          }
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
        const index = registeredEvents.findIndex((e) => e === event);
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

