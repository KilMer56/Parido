import { Player } from "../models/Game";
import { useGame } from "../contexts/GameContext";

export function GameBoard() {
  const { state } = useGame();
  const currentPlayer = state.players.find(
    (player) => player.socketId === state.currentPlayerSocketId
  );
  const otherPlayers = state.players.filter(
    (player) => player.socketId !== state.currentPlayerSocketId
  );

  if (!currentPlayer) {
    return <div>Loading...</div>;
  }

  return (
    <div className="game-board">
      <h3>Game Board</h3>
      <div className="players-container">
        {/* Current player */}
        <div className="player-board current-player">
          <h4>
            {currentPlayer.name}
            <span className="current-player-badge">(You)</span>
          </h4>
          <div className="dice-container">
            {currentPlayer.hand.map((value: number, index: number) => (
              <div key={index} className="dice">
                {value}
              </div>
            ))}
          </div>
        </div>

        {/* Other players */}
        {otherPlayers.map((player: Player) => (
          <div key={player.id} className="player-board">
            <h4>{player.name}</h4>
            <div className="dice-container">
              {player.hand.map((_, index: number) => (
                <div key={index} className="dice hidden">
                  ?
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

