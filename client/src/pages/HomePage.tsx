import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGame, GameProvider } from "../contexts/GameContext";

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
    <div className="container">
      <h1>Parido</h1>
      <p className="description">
        A fast-paced multiplayer game where players compete in real-time. 
        Create a new game or join an existing one to start playing!
      </p>
      <button className="create-game" onClick={createGame}>
          Create Game
        </button>
      <form onSubmit={handleJoinGame} className="join-form">
        <input
          id="join-game-input"
          type="text"
          value={gameId}
          onChange={(e) => setGameId(e.target.value)}
          placeholder="Enter game ID"
          className="join-input"
        />
        <button type="submit" className="submit-game">
          Join Game
        </button>
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
