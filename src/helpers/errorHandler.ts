import logger from "../utils/winstonLogger";

export default class ErrorHandler {
  /**
   * Logs the given error message with the given method name prefix.
   * @param {unknown} error - The error message to log.
   * @param {string} methodName - The name of the method that encountered the error.
   * @param {string} [customMessage] - An additional message to add to the error message.
   */
  public logError(
    error: unknown,
    methodName: string,
    customMessage?: string
  ): void {
    try {
      const messagePrefix = customMessage ? `${customMessage}: ` : "";
      const errorMessage = this.formatErrorMessage(error, messagePrefix);

      this.logMessage(methodName, errorMessage);
    } catch (loggingError) {
      this.logMessage(
        "ErrorHandler",
        `An error occurred while logging the error: ${loggingError}`
      );
    }
  }

  /**
   * Formats the given error into a string message that can be logged.
   * @param {unknown} error - The error to format.
   * @param {string} messagePrefix - A prefix to add to the formatted error message.
   * @returns {string} The formatted error message.
   */
  private formatErrorMessage(error: unknown, messagePrefix: string): string {
    try {
      if (error === null) {
        return `${messagePrefix}Received a null error.`;
      }

      if (error instanceof Error) {
        return `${messagePrefix}Error: ${error.message}`;
      }

      if (typeof error === "string") {
        return `${messagePrefix}String error: ${error}`;
      }

      if (typeof error === "object" && error !== null) {
        const errorObject =
          Object.keys(error).length === 0
            ? `{}`
            : JSON.stringify(error, Object.getOwnPropertyNames(error));
        return `${messagePrefix}Object error: ${errorObject}`;
      }

      return `${messagePrefix}Unknown error type encountered: ${String(error)}`;
    } catch (formattingError) {
      logger.error(
        `An error occurred while formatting the error message: ${formattingError}`
      );
      return `${messagePrefix}Error formatting failed.`;
    }
  }

  /**
   * Logs the given error message with the given method name prefix.
   * @param {string} methodName - The name of the method that encountered the error.
   * @param {string} message - The error message to log.
   */
  private logMessage(methodName: string, message: string): void {
    logger.error(`[Method: ${methodName}] ${message}`);
  }


  /**
   * Logs the given error message without throwing an error. This is useful in scenarios
   * where you want to log an error but don't want to throw an error.
   * @param {string} errorMessage - The error message to log.
   */
  public logThrowError(errorMessage: string): void {
    logger.error(errorMessage);
    throw new Error(errorMessage);
  }
}
