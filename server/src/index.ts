import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import Logger from "./utils/logger";
import { basicHandler, EventHandler } from "./events/basicHandler";
import { gameHandler } from "./events/gameHandler";

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["*"],
  },
  path: "/socket.io/",
  transports: ["websocket", "polling"],
  pingTimeout: 60000,
  pingInterval: 25000,
});

const port = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

// Basic health check endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// Event handlers
const handlers: EventHandler[] = [basicHandler, gameHandler];

// Socket.IO connection handling
io.on("connection", (socket: Socket) => {
  Logger.info("New client connected:", socket.id);
  Logger.info("Total connected clients:", io.engine.clientsCount);
  Logger.info("Client transport:", socket.conn.transport.name);

  // Register event handlers
  handlers.forEach((handler) => {
    handler.registerEvents(socket);
  });
});

// Start server
httpServer.listen(port, () => {
  Logger.info(`Server is running on port ${port}`);
  Logger.info(`Socket.IO server is ready to accept connections`);
  Logger.info(
    `CORS origin set to: ${process.env.CLIENT_URL || "http://localhost:5173"}`
  );
});

