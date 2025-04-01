import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server, Socket } from "socket.io";

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
  transports: ["polling", "websocket"],
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
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// Socket.IO connection handling
io.on("connection", (socket: Socket) => {
  console.log("New client connected:", socket.id);
  console.log("Total connected clients:", io.engine.clientsCount);
  console.log("Client transport:", socket.conn.transport.name);

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    console.log("Remaining connected clients:", io.engine.clientsCount);
  });

  // Handle errors
  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });
});

// Start server
httpServer.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Socket.IO server is ready to accept connections`);
  console.log(
    `CORS origin set to: ${process.env.CLIENT_URL || "http://localhost:5173"}`
  );
});

