import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGame, GameProvider } from "../contexts/GameContext";

function GameContent() {
  const { state: gameState, joinGame } = useGame();
  const { gameId: urlGameId } = useParams();
  const navigate = useNavigate();

  // Handle initial URL state
  useEffect(() => {
    if (urlGameId && !gameState.gameId) {
      joinGame(urlGameId);
    }
  }, [urlGameId, gameState.gameId, joinGame]);


  const handleLeaveGame = () => {
    navigate('/');
  };

  return (
    <div className="game-container">
      <div className="game-header">
        <div className="game-info">
          <h1>Game #{gameState.gameId}</h1>
          <p className="game-timestamp">Created: {gameState.timestamp ? new Date(gameState.timestamp).toLocaleString() : 'Loading...'}</p>
        </div>
        <button className="leave-game" onClick={handleLeaveGame}>
          Leave Game
        </button>
      </div>

      <div className="game-content">
        <div className="game-status">
          <div className="status-card">
            <h3>Status</h3>
            <p className="status-value">Waiting for players...</p>
          </div>
        </div>

        <div className="game-board">
          <div className="board-placeholder">
            <p>Game board will be displayed here</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function GamePage() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
}

