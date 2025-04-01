import { getCurrentDatetime } from "./date";

class Logger {
  public static info(message: string, ...args: unknown[]): void {
    console.log(`[INFO] ${getCurrentDatetime()}: ${message}`, ...args);
  }

  public static error(message: string, ...args: unknown[]): void {
    console.error(`[ERROR] ${getCurrentDatetime()}: ${message}`, ...args);
  }

  public static debug(message: string, ...args: unknown[]): void {
    console.debug(`[DEBUG] ${getCurrentDatetime()}: ${message}`, ...args);
  }

  public static warn(message: string, ...args: unknown[]): void {
    console.warn(`[WARN] ${getCurrentDatetime()}: ${message}`, ...args);
  }
}

export default Logger;

