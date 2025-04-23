import { useNavigate } from "react-router-dom";
import { useGame } from "../contexts/GameContext";
import { leaveGame } from "../types/actions";
import { GameBoard } from "../components/GameBoard";
import "../styles/GameBoard.css";
import { GameResults } from "../components/GameResults";
import { GameLobby } from "../components/GameLobby";

function GameContent() {
  const { state: gameState, dispatch } = useGame();
  const navigate = useNavigate();

  const handleLeaveGame = () => {
    // Todo: Fix join when leaving
    dispatch(leaveGame());
    navigate("/");
  };

  return (
    <div className="game-container">
      <div className="game-header">
        <div className="game-info">
          <h1>Game #{gameState.gameId}</h1>
        </div>
        <button className="leave-game" onClick={handleLeaveGame}>
          Leave Game
        </button>
      </div>

      <div className="game-content">
        {gameState.status === "in_progress" ? (
          <GameBoard />
        ) : gameState.status === "finished" ? (
          <GameResults />
        ) : (
          <GameLobby gameState={gameState} />
        )}
      </div>
    </div>
  );
}

export function GamePage() {
  return <GameContent />;
}

