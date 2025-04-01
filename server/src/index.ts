import express, { Request, Response } from "express";
import cors from "cors";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import Logger from "./utils/logger";
import { EventHandler } from "./events/basicHandler";
import { basicHandler } from "./events/basicHandler";
import { gameHandler } from "./events/gameHandler";
import { Config } from "./config";

class GameServer {
  private app: express.Application;
  private httpServer: ReturnType<typeof createServer>;
  private io: Server;
  private config: Config;
  private handlers: EventHandler[];

  constructor() {
    // Initialize configuration
    this.config = new Config();

    // Initialize Express
    this.app = express();
    this.httpServer = createServer(this.app);

    // Initialize Socket.IO
    this.io = new Server(this.httpServer, {
      cors: this.config.getCorsConfig(),
      path: "/socket.io/",
      transports: ["websocket", "polling"],
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    // Initialize handlers
    this.handlers = [basicHandler, gameHandler];

    // Setup middleware and routes
    this.setupMiddleware();
    this.setupRoutes();
    this.setupSocketHandlers();
  }

  private setupMiddleware(): void {
    this.app.use(cors(this.config.getCorsConfig()));
    this.app.use(express.json());
  }

  private setupRoutes(): void {
    this.app.get("/health", (_req: Request, res: Response) => {
      res.json({ status: "ok" });
    });
  }

  private setupSocketHandlers(): void {
    this.io.on("connection", (socket: Socket) => {
      Logger.info("New client connected:", socket.id);
      Logger.info("Total connected clients:", this.io.engine.clientsCount);
      Logger.info("Client transport:", socket.conn.transport.name);

      // Register event handlers
      this.handlers.forEach((handler) => {
        handler.registerEvents(socket);
      });
    });
  }

  public start(): void {
    const port = this.config.getPort();

    this.httpServer.listen(port, () => {
      Logger.info(`Server is running on port ${port}`);
      Logger.info(`Socket.IO server is ready to accept connections`);
      Logger.info(`CORS origin set to: ${this.config.getClientUrl()}`);
    });
  }
}

// Create and start the server
const server = new GameServer();
server.start();

