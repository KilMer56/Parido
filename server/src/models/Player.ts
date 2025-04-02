import { randomId } from "../utils/random";
import { Dice } from "./Dice";

export class Player {
  private id: string;
  private name: string;
  private dices: Dice[];
  private socketId: string;

  constructor(socketId: string) {
    this.id = randomId();
    this.name = `Player ${this.id.slice(0, 4)}`;
    this.dices = [];
    this.socketId = socketId;
  }

  public rollDices() {
    this.dices.forEach((dice) => dice.roll());
  }

  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getSocketId(): string {
    return this.socketId;
  }
}

