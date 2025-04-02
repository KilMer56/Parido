import { Player } from "../models/Game";
import { useGame } from "../contexts/GameContext";
import { placeBid } from "../types/actions";

export function GameBoard() {
  const { state, dispatch } = useGame();
  const currentPlayer = state.players.find(
    (player) => player.socketId === state.currentPlayerSocketId
  );
  const otherPlayers = state.players.filter(
    (player) => player.socketId !== state.currentPlayerSocketId
  );

  const handleBid = () => {
    // Handle bid action
    dispatch(placeBid(1, 2));
  };

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
      <div className="actions-container">
        <button className="action bid-button" onClick={handleBid}>
          Bid
        </button>
        <button className="action challenge-button">Challenge</button>
      </div>
    </div>
  );
}

