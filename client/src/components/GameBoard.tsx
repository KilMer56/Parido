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
    dispatch(placeBid(1, 2));
  };

  if (!currentPlayer) {
    return <div>Loading...</div>;
  }

  return (
    <div className="game-board">
      <h3>Game Board</h3>
      <div className="players-container">
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
      {state.currentBid && (
        <div className="bid-container">
          <h4>Current Bid</h4>
          <div className="bid">
            <span className="bid-quantity">{state.currentBid.quantity}</span>
            <span className="bid-value">{state.currentBid.value}</span>
          </div>
        </div>
      )}
      Active Player: {state.activePlayerSocketId}
      <br />
      Current Player: {state.currentPlayerSocketId}
      <div className="actions-container">
        <button
          className="action bid-button"
          onClick={handleBid}
          disabled={state.currentPlayerSocketId !== state.activePlayerSocketId}
        >
          Bid
        </button>
        <button
          className="action challenge-button"
          disabled={state.currentPlayerSocketId !== state.activePlayerSocketId}
        >
          Challenge
        </button>
      </div>
    </div>
  );
}

