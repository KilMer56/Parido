import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useGame, GameProvider } from "../contexts/GameContext";

function GameContent() {
  const { state: gameState, joinGame } = useGame();
  const { gameId: urlGameId } = useParams();

  // Handle initial URL state
  useEffect(() => {
    if (urlGameId && !gameState.gameId) {
      joinGame(urlGameId);
    }
  }, [urlGameId, gameState.gameId, joinGame]);

  return (
    <div>
      <h1>Game #{gameState.gameId}</h1>
      <p>Created at: {gameState.timestamp}</p>
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

