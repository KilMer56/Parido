import { Socket } from "socket.io";

export function emitError(socket: Socket, error: unknown) {
  if (error instanceof Error) {
    socket.emit("error", { name: error.name, message: error.message });
  } else {
    socket.emit("error", { message: "An unknown error occurred" });
  }
}

