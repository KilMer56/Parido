import { useState, useEffect } from "react";
import { useGame } from "../contexts/GameContext";
import { createGame, joinGame } from "../types/actions";
import { useNavigate } from "react-router-dom";

function HomeContent() {
  const { dispatch, state } = useGame();
  const [gameId, setGameId] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedGameId = localStorage.getItem("gameId");
    if (storedGameId) {
      navigate(`/${storedGameId}`);
    }
  }, [navigate]);

  useEffect(() => {
    if (state.gameId) {
      navigate(`/${state.gameId}`);
    }
  }, [state.gameId, navigate]);

  const handleCreateGame = async () => {
    dispatch(createGame(username.trim()));
  };

  const handleJoinGame = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(joinGame(gameId.trim(), username.trim()));
  };

  return (
    <div className="container">
      <h1>Parido</h1>
      <p className="description">
        A multiplayer game where players lie to each other. Create a new game or
        join an existing one to start playing!
      </p>
      <input
        id="username-input"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Enter username"
        className="input"
        minLength={4}
        maxLength={12}
        required={true}
      />
      <button className="create-game" onClick={handleCreateGame}>
        Create Game
      </button>
      <form onSubmit={handleJoinGame} className="join-form">
        <input
          id="join-game-input"
          type="text"
          value={gameId}
          onChange={(e) => setGameId(e.target.value)}
          placeholder="Enter game ID"
          className="input"
          minLength={2}
          maxLength={12}
          required={true}
        />
        <button type="submit" className="submit-game">
          Join Game
        </button>
      </form>
    </div>
  );
}

export function HomePage() {
  return <HomeContent />;
}

