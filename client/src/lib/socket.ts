import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";
console.log("Connecting to socket server at:", SOCKET_URL);

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  path: "/socket.io/",
  transports: ["websocket", "polling"],
  withCredentials: true,
  timeout: 60000,
});

// Connection event handlers
socket.on("connect", () => {
  console.log("Connected to server:", socket.id);
  console.log("Transport:", socket.io.engine.transport.name);
  console.log("Connected status:", socket.connected);
});

// Game functions
export const createGame = () => {
  socket.emit("createGame");
};

// Game Handlers
socket.on("gameCreated", (game) => {
  console.log("Game created:", game);
});

socket.on("disconnect", () => {
  console.log("Disconnected from server");
  console.log("Connected status:", socket.connected);
});

socket.on("connect_error", (error) => {
  console.error("Connection error:", error);
  console.log("Connected status:", socket.connected);
});

socket.on("error", (error) => {
  console.error("Socket error:", error);
});

// Export a function to get the socket instance
export const getSocket = () => socket;

