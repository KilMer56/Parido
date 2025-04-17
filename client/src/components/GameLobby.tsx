import { useGame } from "../contexts/GameContext";
import { GameState, Player } from "../models/Game";
import { startGame } from "../types/actions";

export function GameLobby(props: { gameState: GameState }) {
  const { dispatch } = useGame();

  const handleStartGame = () => {
    if (props.gameState.gameId) {
      dispatch(startGame());
    }
  };

  const canStart =
    props.gameState.status === "waiting" && props.gameState.players.length > 1;

  const getStatusText = () => {
    if (props.gameState.status === "in_progress") {
      return "Game in progress";
    } else if (props.gameState.status === "finished") {
      return "Game finished";
    } else if (props.gameState.players.length === props.gameState.maxPlayers) {
      return `Lobby is full (${props.gameState.players.length}/${props.gameState.maxPlayers}), ready to start!`;
    } else if (props.gameState.players.length > 1) {
      return `Players (${props.gameState.players.length}/${props.gameState.maxPlayers}), waiting for game to start...`;
    } else {
      return `Waiting for players (${props.gameState.players.length}/${props.gameState.maxPlayers})`;
    }
  };

  return (
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
            {props.gameState.players.map((player: Player) => (
              <li key={player.id}>{player.name}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

