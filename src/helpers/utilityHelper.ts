import ErrorHandler from "./errorHandler";
import logger from "../utils/winstonLogger";
import fs from "fs";
import path from "path";
import { FileEncoding } from "../config/app.settings";

class UtilityHelper {
  // Create new instance of ErrorHandler
  private errorHandler = new ErrorHandler();

  /**
   * Writes the given content to the specified file path.
   * If no content is provided, logs a warning and throws an error.
   * If an error occurs during the write operation, logs the error and throws an exception.
   * @param path - The file system path to which to write the content.
   * @param content - The content to write to the file.
   * @param keyName - A key name to use in the log messages.
   * @throws {Error} If no content is provided or if an error occurs during the write operation.
   */
  public writeFile(path: string, content: string, keyName: string) {
    if (!content) {
      logger.warn(`No content provided for file: ${keyName}`);
      throw new Error(`No content provided for file: ${keyName}`);
    }

    try {
      fs.writeFileSync(path, content, FileEncoding.UTF8);
      logger.info(`Successfully saved file: ${keyName}`);
    } catch (error) {
      this.errorHandler.logError(error, "saveFile");
      throw error;
    }
  }

  /**
   * Loads the content of a file at the specified path.
   * If the file does not exist, logs an error and throws an exception.
   * If there is an error during the file read operation, logs the error and throws an exception.
   *
   * @param path - The file system path from which to load the file content.
   * @throws Will throw an error if the file does not exist or if there is an error during the file read operation.
   */
  public async readFile(path: string) {
    try {
      // Check if the file exists before reading
      if (!(await this.doesFileExists(path))) {
        throw new Error(`File not found: ${path}`);
      }

      const content = fs.readFileSync(path, FileEncoding.UTF8);
      logger.info(`Successfully loaded file: ${path}`);
      return content;
    } catch (error) {
      this.errorHandler.logError(error, "loadFile");
      throw error;
    }
  }

  /**
   * Checks if a directory exists at the given path.
   * If the directory exists, logs an info message with the relative path from the current working directory.
   * If the directory does not exist, logs a warning message with the relative path from the current working directory.
   * If there is an error during the directory existence check, logs the error and throws an exception.
   *
   * @param dirPath - The file system path to check for directory existence.
   * @param envName - Optional environment name to include in the log message.
   * @returns {Promise<boolean>} A promise that resolves to true if the directory exists, false otherwise.
   * @throws Will throw an error if there is an error during the directory existence check.
   */
  public async doesDirExists(
    dirPath: string,
    envName?: string
  ): Promise<boolean> {
    try {
      // Calculate the relative path from the current working directory
      const relativePath = path.relative(process.cwd(), dirPath);

      const exists = await fs.promises
        .access(dirPath)
        .then(() => true)
        .catch(() => false);

      if (exists) {
        logger.info(`File ${envName} exists on path: '${relativePath}'`);
      } else {
        logger.warn(
          `File ${envName} does not exist on path: '${relativePath}'`
        );
      }

      return exists;
    } catch (error) {
      this.errorHandler.logError(
        error,
        "doesDirExists",
        "Failed to check directory existence"
      );
      throw error;
    }
  }

  /**
   * Checks if a file exists at the given path.
   * If the file exists, logs an info message with the relative path from the current working directory.
   * If the file does not exist, logs a warning message with the relative path from the current working directory.
   * If there is an error during the file existence check, logs the error and throws an exception.
   *
   * @param filePath - The file system path to check for file existence.
   * @param envName - Optional environment name to include in the log message.
   * @returns {Promise<boolean>} A promise that resolves to true if the file exists, false otherwise.
   * @throws Will throw an error if there is an error during the file existence check.
   */
  public async doesFileExists(
    filePath: string,
    envName?: string
  ): Promise<boolean> {
    try {
      // Calculate the relative path from the current working directory
      const relativePath = path.relative(process.cwd(), filePath);

      const exists = await fs.promises
        .access(filePath)
        .then(() => true)
        .catch(() => false);

      if (exists) {
        return true;
      } else {
        logger.warn(
          `File ${envName} does not exist on path: '${relativePath}'`
        );
      }

      return exists;
    } catch (error) {
      this.errorHandler.logError(
        error,
        "doesFileExists",
        "Failed to check file existence"
      );
      throw error;
    }
  }

  /**
   * Ensures that a directory exists at the given path. If the directory does not exist, creates it.
   * If the directory already exists, does nothing.
   *
   * @param path - The file system path where the directory should exist.
   * @throws Will throw an error if there is an issue creating the directory.
   */
  public ensureDirExists(path: string): void {
    try {
      if (!fs.existsSync(path)) {
        fs.mkdirSync(path, { recursive: true });
        logger.info(`Created new directory: ${path}`);
      }
    } catch (error) {
      this.errorHandler.logError(error, "ensureDirectoryExists");
      throw error;
    }
  }

  /**
   * Ensures that a file exists at the given path. If the file does not exist, creates it.
   * If the file already exists, does nothing.
   *
   * @param path - The file system path where the file should exist.
   * @throws Will throw an error if there is an issue creating the file.
   */
  public ensureFileExists(path: string): void {
    try {
      if (!fs.existsSync(path)) {
        fs.writeFileSync(path, "", { flag: "wx" }); // Create an empty file if it doesn't exist
        logger.info(`Created new file: ${path}`);
      }
    } catch (error) {
      this.errorHandler.logError(error, "ensureFileExists");
      throw error;
    }
  }

  /**
   * Returns the resolved absolute directory path by combining the given directory path and the current working directory.
   * If an error occurs during directory path construction, logs the error and throws an exception.
   *
   * @param dirPath - The directory path to use for constructing the absolute directory path.
   * @returns {string} The resolved absolute directory path.
   * @throws Will throw an error if an error occurs during directory path construction.
   */
  public getDirPath(dirPath: string): string {
    try {
      // Validate inputs
      if (!dirPath) {
        throw new Error("Invalid arguments: 'dirPath' is required.");
      }

      return path.resolve(process.cwd(), dirPath);
    } catch (error) {
      this.errorHandler.logError(error, "getDirPath");
      throw error;
    }
  }

  /**
   * Returns the resolved file path by combining the given directory path and file name.
   * Validates the inputs and throws an error if either is invalid.
   * If an error occurs during file path construction, logs the error and throws an exception.
   *
   * @param dirPath - The directory path to use for constructing the file path.
   * @param fileName - The file name to use for constructing the file path.
   * @returns {string} The resolved file path.
   * @throws Will throw an error if the inputs are invalid or if an error occurs during file path construction.
   */
  public getFilePath(dirPath: string, fileName: string): string {
    try {
      // Validate inputs
      if (!dirPath || !fileName) {
        throw new Error(
          "Invalid arguments: ''dirPath' and 'fileName' are required."
        );
      }

      // Get directory path
      const getDirPath = this.getDirPath(dirPath);

      // Join the directory path and file name
      return path.join(getDirPath, fileName);
    } catch (error) {
      this.errorHandler.logError(
        error,
        "getFilePath",
        `Failed to construct file path for dirPath: '${dirPath}', fileName: '${fileName}'`
      );
      throw error;
    }
  }

  /**
   * Returns the element at the specified reversed index from the array.
   *
   * @param arr - The array from which to retrieve the element.
   * @param index - The index from the end of the array.
   * @returns The element at the reversed index.
   * @throws If the index is out of bounds.
   */
  public getReversedData(arr: string[], index: number): string {
    try {
      return arr[arr.length - 1 - index];
    } catch (error) {
      this.errorHandler.logError(error, "getReversedData");
      throw error;
    }
  }

  /**
   * Normalizes a string by trimming leading and trailing whitespace
   * and replacing multiple spaces with a single space.
   *
   * @param str - The input string to be normalized.
   * @returns The normalized string.
   */
  public normalizeString(str: string): string {
    try {
      return str.trim().replace(/\s+/g, " ");
    } catch (error) {
      this.errorHandler.logError(error, "normalizeString");
      throw error;
    }
  }

  /**
   * Replaces "R " and all whitespace characters in the given string, if it exists.
   *
   * @param value - The string to be processed.
   * @returns The processed string.
   */
  public safeReplace(value: string | null | undefined): string {
    try {
      return (value ?? "").replace(/R\s/g, "").replace(/\s/g, "");
    } catch (error) {
      this.errorHandler.logError(error, "safeReplace");
      throw error;
    }
  }

  /**
   * Checks if the given string is a valid number.
   *
   * @param value - The string to be checked.
   * @returns True if the string is a valid number, false otherwise.
   */
  public isValidNumber(value: string): boolean {
    try {
      const numericValue = parseFloat(value);
      const isValid = !isNaN(numericValue);
      if (!isValid) {
        this.errorHandler.logError(
          new Error(`Invalid number: ${value}`),
          "isValidNumber"
        );
      }
      return isValid;
    } catch (error) {
      this.errorHandler.logError(error, "isValidNumber");
      throw error;
    }
  }

  /**
   * Generates a random hexadecimal string of the specified length.
   *
   * @param length - The desired length of the random string. Must be a positive integer.
   * @returns A random hexadecimal string of the specified length.
   * @throws Error if the length is not a positive integer or if an error occurs during random string generation.
   */
  public createRandomString(length: number): string {
    if (length <= 0) {
      throw new Error("Length must be a positive integer.");
    }

    try {
      const byteLength = Math.ceil(length / 2); // Each byte generates 2 hex characters
      const array = new Uint8Array(byteLength);
      crypto.getRandomValues(array);

      // Convert bytes to hex and slice to the desired length
      return Array.from(array, (byte) => byte.toString(16).padStart(2, "0"))
        .join("")
        .slice(0, length);
    } catch (error) {
      this.errorHandler.logError(error, "createRandomString");
      throw error;
    }
  }
}

export default new UtilityHelper();
