import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGame, GameProvider } from "../contexts/GameContext";

interface Player {
  id: string;
  name: string;
}

function GameContent() {
  const { state: gameState, joinGame, startGame } = useGame();
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

  const handleStartGame = () => {
    if (gameState.gameId) {
      startGame(gameState.gameId);
    }
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
            <p className="status-value">
              {gameState.isStarted 
                ? "Game in progress" 
                : `Waiting for players (${gameState.currentPlayers}/${gameState.maxPlayers})`}
            </p>
            {!gameState.isStarted && gameState.canStart && (
              <button 
                className="start-game-button"
                onClick={handleStartGame}
              >
                Start Game
              </button>
            )}
            <div className="player-list">
              <h4>Players</h4>
              <ul>
                {gameState.players.map((player: Player) => (
                  <li key={player.id}>{player.name}</li>
                ))}
              </ul>
            </div>
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

