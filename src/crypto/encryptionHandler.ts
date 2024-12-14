import EnvFilesHandler from "./envFilesHandler";
import CryptoUtil from "./cryptoUtil";
import CryptoService from "./cryptoService";
import { FileEncoding } from "../config/app.settings";
import path from "path";
import fs from "fs";
import utilityHelper from "../helpers/utilityHelper";
import logger from "../utils/winstonLogger";

export default class EncryptionHandler extends EnvFilesHandler {
  /**
   * Generates a cryptographically secure random secret key of the default length.
   *
   * @returns The generated secret key as a base64 string or undefined if an error occurs.
   * @throws {Error} If an error occurs during key generation.
   */
  public generateSecretKey(): string {
    try {
      return CryptoUtil.generateSecretKey();
    } catch (error) {
      this.errorHandler.logError(
        error,
        "generateSecretKey",
        "Failed to generate secret key"
      );
      throw error;
    }
  }

  /**
   * Retrieves the secret key for encryption/decryption processes.
   *
   * Validates the presence of the secret key, logging and throwing an error if it is not found.
   *
   * @param secretKey - The secret key to validate and return.
   * @returns The validated secret key.
   * @throws {Error} If the secret key is not found or an error occurs during retrieval.
   */
  private getSecretKey(secretKey: string): string {
    try {
      if (!secretKey) {
        this.errorHandler.logThrowError("Key not found in .env file");
      }
      return secretKey;
    } catch (error) {
      this.errorHandler.logError(
        error,
        "getSecretKey",
        "Failed to get secret key"
      );
      throw error;
    }
  }

  /**
   * Initializes the encryption process by setting the environment file path and
   * deriving the secret key.
   *
   * @param env - The name of the environment to resolve the path.
   * @param secretKey - The initial secret key used for deriving the encryption key.
   * @throws {Error} If an error occurs while initializing encryption.
   */
  public initializeEncryption(env: string, secretKey: string): void {
    try {
      this.envFilePath = path.resolve(this.envDirPath, env);
      this.secretKey = this.getSecretKey(secretKey);
    } catch (error) {
      this.errorHandler.logError(
        error,
        "initializeEncryption",
        "Failed to initialize encryption"
      );
      throw error;
    }
  }

  public async encryptEnvVariables(): Promise<void> {
    try {
      // Read the environment file
      const envFileContent = this.readEnvFileAsLines();
      // Encrypt the environment variables, line by line
      const encryptedLines = await this.encryptLines(envFileContent); // Await the promise
      // Write the encrypted lines to the environment file
      this.writeEnvFileLines(encryptedLines);
      // Log the encryption success message
      this.logEncryptionSuccess(envFileContent.length, encryptedLines.length);
    } catch (error) {
      this.errorHandler.logError(
        error,
        "encryptEnvParameters",
        "Failed to encrypt environment parameters"
      );
      throw error;
    }
  }

  private async encryptLines(lines: string[]): Promise<string[]> {
    try {
      if (
        !Array.isArray(lines) ||
        !lines.every((line) => typeof line === "string")
      ) {
        logger.error("Input must be an array of strings.");
        throw new TypeError("Input must be an array of strings.");
      }

      if (lines.every((line) => line.trim() === "")) {
        this.errorHandler.logThrowError(
          "File is completely empty or contains only whitespace."
        );
      }

      const encryptedLines: string[] = [];
      const errors: string[] = [];

      for (let index = 0; index < lines.length; index++) {
        const line = lines[index];
        const trimmedLine = line.trim();

        if (trimmedLine === "") {
          encryptedLines.push(""); // Keep empty lines unchanged
          continue;
        }

        if (!trimmedLine.includes("=")) {
          const errorMessage = this.handleInvalidFormatError(index, line);
          logger.error(errorMessage);
          errors.push(errorMessage);
          continue; // Skip malformed lines
        }

        const [key, value] = trimmedLine.split("=");
        if (value) {
          // Generate encryption metadata
          const encryptionResult = await CryptoService.encrypt(
            value.trim(),
            this.secretKey
          );
          const encryptedValue = JSON.stringify(encryptionResult); // Serialize to JSON
          encryptedLines.push(`${key}=${encryptedValue}`); // Add serialized JSON
        } else {
          encryptedLines.push(line); // Preserve the line if no value
        }
      }

      if (errors.length > 0) {
        this.errorHandler.logError(
          new Error(errors.join("\n")),
          "encryptLines",
          "Failed to encrypt some lines"
        );
      }
      return encryptedLines;
    } catch (error) {
      this.errorHandler.logError(
        error,
        "encryptLines",
        "Failed to encrypt lines"
      );
      throw error;
    }
  }

  /**
   * Reads the contents of the environment file as an array of strings.
   * Each string is a line from the file, and the array is returned in the order
   * that the lines appear in the file.
   *
   * If the file does not exist or cannot be read, the function logs an error
   * and throws an exception.
   *
   * @returns An array of strings, each string representing a line from the file.
   * @throws {Error} If the file does not exist or cannot be read.
   */
  private readEnvFileAsLines(): string[] {
    try {
      return fs.readFileSync(this.envFilePath, FileEncoding.UTF8).split("\n");
    } catch (error) {
      this.errorHandler.logError(
        error,
        "readEnvFile",
        "Failed to read environment file"
      );
      throw error;
    }
  }

  /**
   * Writes an array of strings to the environment file.
   * Each string in the array represents a line to be written.
   *
   * If an error occurs during writing, it logs the error and throws an exception.
   *
   * @param lines - The array of strings to write to the environment file.
   * @throws {Error} If an error occurs during file writing.
   */
  private writeEnvFileLines(lines: string[]): void {
    try {
      utilityHelper.writeFile(
        this.envFilePath,
        lines.join("\n"),
        FileEncoding.UTF8
      );
    } catch (error) {
      this.errorHandler.logError(
        error,
        "writeEnvFile",
        "Failed to write encrypted lines to environment file"
      );
      throw error;
    }
  }

  /**
   * Logs a success message with the number of encrypted variables to the console.
   * This method is called after the encryption process is complete.
   *
   * @param originalCount - The total number of variables in the environment file.
   * @param encryptedCount - The number of variables that were successfully encrypted.
   */
  private logEncryptionSuccess(
    originalCount: number,
    encryptedCount: number
  ): void {
    try {
      const relativePath = path.relative(process.cwd(), this.envFilePath);
      logger.info(
        `Encryption complete. Successfully encrypted ${encryptedCount} variable(s) in the ${relativePath} file.`
      );
    } catch (error) {
      this.errorHandler.logError(
        error,
        "logEncryptionSuccess",
        "Failed to log encryption success"
      );
      throw error;
    }
  }

  /**
   * Constructs an error message for a line with invalid format or no variables.
   *
   * @param index - The zero-based index of the line in the file.
   * @param line - The content of the line that has an invalid format.
   * @returns A formatted error message indicating the line number and the issue.
   */
  private handleInvalidFormatError(index: number, line: string): string {
    try {
      return `Line ${
        index + 1
      } doesn't contain any variables or has invalid format: ${line}`;
    } catch (error) {
      this.errorHandler.logError(
        error,
        "An error occurred while formatting the error message."
      );
      throw error;
    }
  }
}
