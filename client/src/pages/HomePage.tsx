import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../contexts/GameContext";
import GameProvider from "../contexts/GameContext";

function HomeContent() {
  const { createGame, state } = useGame();
  const [gameId, setGameId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (state.gameId) {
      navigate(`/${state.gameId}`);
    }
  }, [state.gameId, navigate]);


  const handleJoinGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (gameId.trim()) {
      navigate(`/${gameId.trim()}`);
      setGameId("");
    }
  };

  return (
    <div>
      <h1>Parido Game</h1>
      <button onClick={createGame}>Create Game</button>
      <form onSubmit={handleJoinGame} style={{ marginTop: "1rem" }}>
        <input
          type="text"
          value={gameId}
          onChange={(e) => setGameId(e.target.value)}
          placeholder="Enter game ID"
          style={{ marginRight: "0.5rem" }}
        />
        <button type="submit">Join Game</button>
      </form>
    </div>
  );
}

export function HomePage() {
  return (
    <GameProvider>
      <HomeContent />
    </GameProvider>
  );
} 