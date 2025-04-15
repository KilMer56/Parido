import { Player } from "../models/Game";
import { useGame } from "../contexts/GameContext";
import { useState } from "react";
import { bid, challenge } from "../types/actions";

export function GameBoard() {
  const { state, dispatch } = useGame();
  const [bidQuantity, setBidQuantity] = useState(1);
  const [bidValue, setBidValue] = useState(1);

  const handleBid = () => {
    dispatch(bid(bidQuantity, bidValue));
  };

  const handleChallenge = () => {
    dispatch(challenge());
  };

  const isActivePlayer =
    state.playerSocketId === state.currentRound?.activePlayerSocketId;

  if (!state.currentRound) {
    return <div>Loading...</div>;
  }

  return (
    <div className="game-board">
      <span className="big-text">Round {state.currentRound.number}</span>
      <div className="players-container">
        {state.players.map((player: Player) => (
          <div
            key={player.id}
            className={
              player.socketId === state.currentRound?.activePlayerSocketId
                ? "player-board active-player"
                : "player-board"
            }
          >
            <h4>
              {player.name}
              {player.socketId === state.playerSocketId && (
                <span className="current-player-badge">(You)</span>
              )}
            </h4>
            <div className="dice-container">
              {player.socketId === state.playerSocketId
                ? state.currentRound?.hand.map(
                    (value: number, index: number) => (
                      <div key={index} className="die">
                        {value}
                      </div>
                    )
                  )
                : Array.from({ length: player.diceCount ?? 5 }).map(
                    (_: unknown, index: number) => (
                      <div key={index} className="die hidden">
                        ?
                      </div>
                    )
                  )}
            </div>
          </div>
        ))}
      </div>
      <div className="bid">
        {state.currentRound?.lastBid ? (
          <>
            <span className="big-text">Current Bid: </span>
            <span className="bid-quantity">
              {state.currentRound?.lastBid.quantity}
            </span>
            <span className="bid-value">🎲</span>
            <span className="bid-value">
              {state.currentRound?.lastBid.value}
            </span>
          </>
        ) : (
          <span className="bid-value no-bid">No bids placed yet</span>
        )}
      </div>
      <div></div>
      <div className="actions-container">
        <div className="bid-inputs">
          <label>
            🎲 Quantity:
            <input
              type="number"
              value={bidQuantity}
              onChange={(e) => setBidQuantity(Number(e.target.value))}
              min="1"
              disabled={!isActivePlayer}
            />
          </label>
          <label>
            🎲 Value:
            <input
              type="number"
              value={bidValue}
              onChange={(e) => setBidValue(Number(e.target.value))}
              min="1"
              disabled={!isActivePlayer}
            />
          </label>
        </div>
        <div className="buttons-container">
          <button
            className="action bid-button"
            onClick={handleBid}
            disabled={!isActivePlayer}
          >
            Bid
          </button>
          <button
            className="action challenge-button"
            onClick={handleChallenge}
            disabled={!isActivePlayer}
          >
            Challenge
          </button>
        </div>
      </div>
    </div>
  );
}

