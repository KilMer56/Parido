import { useGame } from "../contexts/GameContext";

export function GameResults() {
  const { state } = useGame();

  if (state.status !== "finished") {
    return <div>Game Not finished</div>;
  }

  return (
    <div className="game-results">
      <h2>Game Results</h2>
      <h3>
        Winner:{" "}
        {state.players.find(
          (player) => player.socketId === state.winnerSocketId
        )?.name || "Unknown"}
      </h3>
      <div className="logs-container">
        <h4>Game Logs</h4>
        <pre>{JSON.stringify(state.logs, null, 2)}</pre>
      </div>
    </div>
  );
}

