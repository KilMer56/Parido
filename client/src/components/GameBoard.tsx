import { Player } from "../models/Game";
import { SocketManager } from "../events/SocketManager";

interface GameBoardProps {
  players: Player[];
}

export function GameBoard({ players }: GameBoardProps) {
  const socketManager = SocketManager.getInstance();
  const currentSocketId = socketManager.getSocket().id;

  return (
    <div className="game-board">
      <h3>Game Board</h3>
      <div className="players-container">
        {players.map((player: Player) => (
          <div 
            key={player.id} 
            className={`player-board ${player.socketId === currentSocketId ? 'current-player' : ''}`}
          >
            <h4>
              {player.name}
              {player.socketId === currentSocketId && <span className="current-player-badge">(You)</span>}
            </h4>
            <div className="dice-container">
              {player.dices.map((value, index) => (
                <div key={index} className="dice">
                  {value}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 