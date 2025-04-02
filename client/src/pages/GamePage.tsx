import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGame, GameProvider } from "../contexts/GameContext";
import { Player } from "../models/Game";
import { joinGame, startGame, leaveGame } from "../types/actions";
import { GameBoard } from "../components/GameBoard";
import "../styles/GameBoard.css";

function GameContent() {
  const { state: gameState, dispatch } = useGame();
  const { gameId: urlGameId } = useParams();
  const navigate = useNavigate();

  // Handle initial URL state
  useEffect(() => {
    if (urlGameId && !gameState.gameId) {
      dispatch(joinGame(urlGameId));
    }
  }, [urlGameId, gameState.gameId, dispatch]);

  const handleLeaveGame = () => {
    dispatch(leaveGame());
    navigate("/");
  };

  const handleStartGame = () => {
    if (gameState.gameId) {
      dispatch(startGame());
    }
  };

  const canStart =
    gameState.status === "waiting" && gameState.players.length > 1;
  const getStatusText = () => {
    if (gameState.status === "in_progress") {
      return "Game in progress";
    }
    else if (gameState.players.length === gameState.maxPlayers){
      return `Lobby is full (${gameState.players.length}/${gameState.maxPlayers}), ready to start!`;
    }
    else if (gameState.players.length > 1){
      return `Players (${gameState.players.length}/${gameState.maxPlayers}), waiting for game to start...`;
    }
    else{
      return `Waiting for players (${gameState.players.length}/${gameState.maxPlayers})`;
    }
  };

  return (
    <div className="game-container">
      <div className="game-header">
        <div className="game-info">
          <h1>Game #{gameState.gameId}</h1>
          <p className="game-timestamp">
            Joined:{" "}
            {gameState.timestamp
              ? new Date(gameState.timestamp).toLocaleString()
              : "Loading..."}
          </p>
        </div>
        <button className="leave-game" onClick={handleLeaveGame}>
          Leave Game
        </button>
      </div>

      <div className="game-content">
        {gameState.status === "in_progress" ? (
          <GameBoard players={gameState.players} />
        ) : (
          <div className="game-lobby">
            <div className="lobby-card">
              <h3>Game Lobby</h3>
              <p className="status-value">{getStatusText()}</p>
              {canStart && (
                <button className="start-game-button" onClick={handleStartGame}>
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
        )}
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

