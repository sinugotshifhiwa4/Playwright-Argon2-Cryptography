export default class ConstantsConfig {
  // Memory cost
  private static MEMORY_COST = 2 ** 17;

  // Log max size
  private static MAX_SIZE = 10 * 1024 * 1024;

  /**
   * Gets the memory cost of the Argon2 algorithm, which is used for hashing
   * passwords. This value is specified in kilobytes and controls the memory
   * usage of the hashing algorithm. Higher values increase the security of
   * the algorithm but also increase memory usage.
   * @returns {number} The memory cost value in kilobytes.
   */
  public static getMemoryCost(): number {
    return this.MEMORY_COST;
  }

  /**
   * Gets the maximum size of a log file in bytes. This value is used to 
   * configure the maximum size of log files when creating a logger with 
   * multiple transports. The logger will split log messages into multiple files
   * after this size is reached.
   * @returns {number} The maximum size of a log file in bytes.
   */
  public static getLoggerMaxSize(): number {
    return this.MAX_SIZE;
  }
}
