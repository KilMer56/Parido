import { Player } from "../models/Game";
import { useGame } from "../contexts/GameContext";
import { placeBid } from "../types/actions";
import { useState } from "react";

export function GameBoard() {
  const { state, dispatch } = useGame();
  const currentPlayer = state.players.find(
    (player) => player.socketId === state.currentPlayerSocketId
  );
  const otherPlayers = state.players.filter(
    (player) => player.socketId !== state.currentPlayerSocketId
  );

  const [bidQuantity, setBidQuantity] = useState(1);
  const [bidValue, setBidValue] = useState(1);

  const handleBid = () => {
    dispatch(placeBid(bidQuantity, bidValue));
  };

  if (!currentPlayer) {
    return <div>Loading...</div>;
  }

  return (
    <div className="game-board">
      <h3>Game Board</h3>
      <div className="players-container">
        <div
          className={
            state.activePlayerSocketId === state.currentPlayerSocketId
              ? "player-board active-player"
              : "player-board"
          }
        >
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
          <div
            key={player.id}
            className={
              state.activePlayerSocketId === player.socketId
                ? "player-board active-player"
                : "player-board"
            }
          >
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
      <div className="bid-container">
        <h4>Current Bid</h4>
        <div className="bid">
          {state.currentBid ? (
            <>
              <span className="bid-quantity">{state.currentBid.quantity}</span>
              <span className="bid-value">x</span>
              <span className="bid-value">{state.currentBid.value}</span>
            </>
          ) : (
            <span className="bid-value">No bids placed yet</span>
          )}
        </div>
        <div className="bid-inputs">
          <label>
            Quantity:
            <input
              type="number"
              value={bidQuantity}
              onChange={(e) => setBidQuantity(Number(e.target.value))}
              min="1"
            />
          </label>
          <label>
            Value:
            <input
              type="number"
              value={bidValue}
              onChange={(e) => setBidValue(Number(e.target.value))}
              min="1"
            />
          </label>
        </div>
      </div>
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

