import "./App.css";
import { GameProvider, useGame } from "./contexts/GameContext";

function Game() {
  const { state: gameState, createGame } = useGame();

  return (
    <div>
      <h1>Parido Game</h1>
      {gameState.gameId && <p>Current game: #{gameState.gameId}</p>}
      <button onClick={createGame}>Create Game</button>
    </div>
  );
}

function App() {
  return (
    <GameProvider>
      <Game />
    </GameProvider>
  );
}

export default App;

