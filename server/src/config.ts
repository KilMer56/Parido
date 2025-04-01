import dotenv from "dotenv";

export class Config {
  private readonly port: number;
  private readonly clientUrl: string;

  constructor() {
    // Load environment variables
    dotenv.config();

    this.port = parseInt(process.env.PORT || "3001", 10);
    this.clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  }

  public getPort(): number {
    return this.port;
  }

  public getClientUrl(): string {
    return this.clientUrl;
  }

  public getCorsConfig() {
    return {
      origin: this.clientUrl,
      methods: ["GET", "POST"],
      credentials: true,
      allowedHeaders: ["*"],
    };
  }
}

