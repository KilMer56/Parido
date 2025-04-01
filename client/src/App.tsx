import { useEffect } from "react";
import { socket } from "./lib/socket";
import "./App.css";

function App() {
  useEffect(() => {
    // Connect to the socket server
    socket.connect();

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  });

  return (
    <div>
      <h1>Parido Game</h1>
      <button
        onClick={() => {
          socket.emit("join", { room: "test" });
        }}
      >
        Join Room
      </button>
    </div>
  );
}

export default App;

