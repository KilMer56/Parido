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
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// Socket.IO connection handling
io.on("connection", (socket: Socket) => {
  console.log("New client connected:", socket.id);
  console.log("Total connected clients:", io.engine.clientsCount);
  console.log("Client transport:", socket.conn.transport.name);

  // Handle join room event
  socket.on("join", (data) => {
    console.log("Client attempting to join room:", data.room);
    console.log("Current socket rooms:", socket.rooms);

    socket.join(data.room);

    // Emit to all clients in the room except the sender
    socket.to(data.room).emit("userJoined", {
      userId: socket.id,
      room: data.room,
      timestamp: new Date().toISOString(),
    });

    // Also emit to the sender to confirm they joined
    socket.emit("userJoined", {
      userId: socket.id,
      room: data.room,
      timestamp: new Date().toISOString(),
    });

    console.log("User joined room:", data.room);
    console.log("Updated socket rooms:", socket.rooms);
  });

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

