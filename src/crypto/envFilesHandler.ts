import * as envConfig from "../config/environment.config";
import ErrorHandler from "../helpers/errorHandler";
import { FileEncoding } from "../config/app.settings";
import fs from "fs";
import utilityHelper from "../helpers/utilityHelper";
import logger from "../utils/winstonLogger";

export default class EnvFilesHandler {
  // define error handler
  public errorHandler: ErrorHandler;

  // define env Dir path, env file path and secret key
  public envDirPath: string;
  public envFilePath: string;
  public secretKey: string;

  // define base env file path
  private readonly baseEnvFilePath: string;

  constructor() {
    // Create an instance of ErrorHandler
    this.errorHandler = new ErrorHandler();

    // set env dir path
    this.envDirPath = utilityHelper.getDirPath(
      envConfig.EnvironmentConfig.ENV_DIR
    );

    // set base env file path
    this.baseEnvFilePath = utilityHelper.getFilePath(
      this.envDirPath,
      envConfig.EnvironmentConfig.BASE_ENV_FILE
    );

    /*
     * Initialize env file path and secret key to empty strings.
     * These values will be reassigned in the initializeEncryption method.
     */
    this.envFilePath = "";
    this.secretKey = "";

    // Ensure dir and file exist
    utilityHelper.ensureDirExists(this.envDirPath);
    utilityHelper.ensureFileExists(this.baseEnvFilePath);
  }

  /**
   * Writes a key-value pair to the base environment file (.env).
   * Logs an info message upon successful write.
   * If an error occurs during the write operation, logs the error and throws an exception.
   *
   * @param content - The content to write to the .env file.
   * @param keyName - The name of the key being written to the .env file, used in log messages.
   * @throws Will log and throw an error if the write operation fails.
   */
  private writeKeyToBaseEnvFile(content: string, keyName: string): void {
    try {
      utilityHelper.writeFile(this.baseEnvFilePath, content, keyName);
      logger.info(`${keyName} written to .env file`);
    } catch (error) {
      this.errorHandler.logError(
        error,
        "writeEnvFile",
        `Failed to write ${keyName} to .env file`
      );
      throw error;
    }
  }

  private readBaseEnvFile(): string {
    try {
      return fs.readFileSync(this.baseEnvFilePath, FileEncoding.UTF8);
    } catch (error) {
      this.errorHandler.logError(
        error,
        "readEnvFile",
        "Failed to read .env file"
      );
      throw error;
    }
  }

    /**
   * Reads the value of a key from the base environment file.
   * The value is extracted using a regular expression.
   * Logs an error and throws an exception if reading fails.
   *
   * @param keyName - The name of the key to read from the environment file.
   * @returns The value of the key as a string. If the key does not exist in the file, returns undefined.
   * @throws {Error} If an error occurs during file reading.
   */
    public getKeyValue(keyName: string): string | undefined {
        try {
          const envConfig =  this.readBaseEnvFile();
          const regex = new RegExp(`^${keyName}=(.*)$`, "m");
          const match = envConfig.match(regex);
          return match ? match[1] : undefined;
        } catch (error) {
          this.errorHandler.logError(
            error,
            "getKeyValue",
            `Failed to read ${keyName} from .env file`
          );
          throw error;
        }
      }

        /**
   * Stores a key-value pair in the base environment file.
   * If the key already exists, its value is updated; otherwise, the key-value pair is appended.
   * Logs an error and throws an exception if the operation fails.
   *
   * @param keyName - The name of the key to store in the environment file.
   * @param keyValue - The value to be associated with the key.
   * @throws {Error} If an error occurs during file reading or writing.
   */
  public storeBaseEnvKey(keyName: string, keyValue: string): void {
    try {
      // read the env file
      let envConfig = this.readBaseEnvFile();

      // Update or append the specified key
      const regex = new RegExp(`^${keyName}=.*`, "m");
      if (regex.test(envConfig)) {
        envConfig = envConfig.replace(regex, `${keyName}=${keyValue}`);
      } else {
        envConfig += `${keyName}=${keyValue}\n`;
      }

      this.writeKeyToBaseEnvFile(envConfig, keyName);
    } catch (error) {
      this.errorHandler.logError(
        error,
        "storeKeyInEnv",
        `Failed to store ${keyName} in .env file`
      );
      throw error;
    }
  }
}
