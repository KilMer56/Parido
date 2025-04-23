import { Game } from "./Game";

class GameManager {
  private static instance: GameManager;
  private gamesByGameId: Map<string, Game>;

  private constructor() {
    this.gamesByGameId = new Map<string, Game>();
  }

  public static getInstance(): GameManager {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager();
    }
    return GameManager.instance;
  }

  public createGame(): Game {
    const game = new Game();
    this.gamesByGameId.set(game.getId(), game);
    return game;
  }

  public getGame(gameId: string): Game | undefined {
    return this.gamesByGameId.get(gameId);
  }

  public getGameBySocketId(socketId: string): Game | undefined {
    for (const game of this.gamesByGameId.values()) {
      if (
        game.getPlayers().some((player) => player.getSocketId() === socketId)
      ) {
        return game;
      }
    }
    return undefined;
  }

  public removeGame(gameId: string): void {
    this.gamesByGameId.delete(gameId);
  }

  public getAllGames(): Map<string, Game> {
    return this.gamesByGameId;
  }
}

export const gameManager = GameManager.getInstance();

