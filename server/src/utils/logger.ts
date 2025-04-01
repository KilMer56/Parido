class Logger {
  public static info(message: string, ...args: any[]): void {
    console.log(`[INFO] ${new Date().toISOString()}: ${message}`, ...args);
  }

  public static error(message: string, ...args: any[]): void {
    console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, ...args);
  }

  public static debug(message: string, ...args: any[]): void {
    console.debug(`[DEBUG] ${new Date().toISOString()}: ${message}`, ...args);
  }

  public static warn(message: string, ...args: any[]): void {
    console.warn(`[WARN] ${new Date().toISOString()}: ${message}`, ...args);
  }
}

export default Logger;

