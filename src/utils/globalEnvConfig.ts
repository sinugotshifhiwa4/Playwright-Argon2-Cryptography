import dotenv from "dotenv";
import * as envConfig from "../config/environment.config";
import utilityHelper from "../helpers/utilityHelper";
import path from "path";
import fs from "fs";
import ErrorHandler from "../helpers/errorHandler";
import logger from "./winstonLogger";

export default class GlobalEnvConfig {
  // Create an instance of the ErrorHandler
  private static errorHandler: ErrorHandler = new ErrorHandler();

  /**
   * Initializes the environment configuration.
   * This function ensures that the environment directory exists, validates the base environment file
   * if it exists, loads the base environment variables, and determines the current environment.
   * If the base environment file does not exist, a warning message is logged.
   * If an error occurs during the setup process, an error is logged and thrown.
   */
  public static async initEnvConfiguration() {
    try {
      // ensure the environment directory exists
      utilityHelper.ensureDirExists(envConfig.EnvironmentConfig.ENV_DIR);

      // base env file path
      const baseEnvFilePath = path.resolve(
        envConfig.EnvironmentConfig.ENV_DIR,
        envConfig.EnvironmentConfig.BASE_ENV_FILE
      );

      // if the base environment file exists, and if not, log warn message
      this.handleEnvFileLoading(
        baseEnvFilePath,
        await utilityHelper.doesFileExists(
          baseEnvFilePath,
          `'${envConfig.EnvironmentConfig.BASE_ENV_FILE}'`
        )
      );

      // load base environment variables
      const env = this.loadEnv();

      // determine the current environment
      this.loadEnvFile(
        envConfig.EnvironmentFilePathsMap[
          env as keyof typeof envConfig.EnvironmentFilePathsMap
        ]
      );
    } catch (error) {
      this.errorHandler.logError(
        error,
        "initEnvConfiguration",
        "Failed to set up environment variables"
      );
      throw error;
    }
  }

  /**
   * Validates and retrieves the current environment from process variables.
   * It checks if the environment specified in the process environment variables is valid
   * by ensuring it matches one of the keys in the EnvironmentFilePathsMap.
   * If the environment is invalid or not specified, it throws an error.
   * Logs the error if it occurs and throws an exception.
   *
   * @returns {string} The validated environment string.
   * @throws Will log and throw an error if the environment is invalid or cannot be loaded.
   */
  private static loadEnv(): string {
    try {
      const env = process.env.ENV;
      if (
        !env ||
        !Object.keys(envConfig.EnvironmentFilePathsMap).includes(env)
      ) {
        throw new Error(
          `Invalid environment specified: ${env}. Expected one of: ${Object.keys(
            envConfig.EnvironmentFilePathsMap
          ).join(", ")}`
        );
      }
      return env;
    } catch (error) {
      this.errorHandler.logError(
        error,
        "loadEnv",
        "Failed to load environment"
      );
      throw error;
    }
  }

  /**
   * Loads environment variables from the specified file using the dotenv library.
   * If the file does not exist, it logs a warning message with the file path.
   * If an error occurs, it logs the error and throws an exception.
   *
   * @param fileName - The name of the file from which to load environment variables.
   */
  private static loadEnvFile(fileName: string): void {
    try {
      // get the path to the file
      const filePath = this.getEnvFilePath(fileName);

      if (fs.existsSync(filePath)) {
        // Get the relative path from the current working directory
        const relativePath = path.relative(process.cwd(), filePath);
        this.loadEnvironmentVariables(relativePath);
        logger.info(
          `Successfully loaded variables for '${relativePath}' environment.`
        );
      } else {
        logger.warn(
          `The environment '${process.env.ENV}' was specified at script command.\n` +
            `But, the corresponding environment file was not found at the expected path.\n` +
            `Please ensure that the environment-specific file (e.g., dev, uat, prod) exists in the "envs" directory.`
        );
      }
    } catch (error) {
      this.errorHandler.logError(
        error,
        "loadEnvFile",
        "Failed to load environment file"
      );
      throw error;
    }
  }

  /**
   * Handles loading of the base environment file (.env) if it exists.
   * If the file exists, it loads the environment variables from the file.
   * Otherwise, it logs a warning message.
   * If an error occurs during file loading, it logs the error and throws an exception.
   *
   * @param baseEnvFilePath - The path to the base environment file.
   * @param baseEnvExists - A boolean indicating whether the base environment file exists.
   */
  private static handleEnvFileLoading(
    baseEnvFilePath: string,
    baseEnvExists: boolean
  ) {
    try {
      // Check if the base environment file exists
      if (baseEnvExists) {
        this.loadEnvFile(baseEnvFilePath);
      } else {
        logger.warn(`Base environment file not found. Skipping file load.`);
      }
    } catch (error) {
      this.errorHandler.logError(
        error,
        "globalSetup",
        "Failed to set up environment variables"
      );
      throw error;
    }
  }

  /**
   * Loads environment variables from the specified file path using the dotenv library.
   * Overrides existing environment variables if they are already set.
   * Logs an error and throws an exception if loading fails.
   *
   * @param filePath - The path to the environment file from which variables are to be loaded.
   */
  private static loadEnvironmentVariables(filePath: string): void {
    try {
      const result = dotenv.config({ path: filePath, override: true });

      if (result.error) {
        logger.error(
          `Error loading environment variables from ${filePath}: ${result.error.message}`
        );
        throw new Error(
          `Error loading environment variables from ${filePath}: ${result.error.message}`
        );
      }
    } catch (error) {
      this.errorHandler.logError(
        error,
        "loadEnvironmentVariablesFromFile",
        `Failed to load variables from ${filePath}`
      );
      throw error;
    }
  }

  /**
   * Returns the path to the environment file with the given file name.
   * This function will log an error if an exception occurs and throw the error.
   *
   * @param fileName - The name of the file to get the path for (e.g., ".env", ".env.dev", etc.)
   * @returns The path to the environment file.
   */
  private static getEnvFilePath(fileName: string): string {
    try {
      return path.resolve(envConfig.EnvironmentConfig.ENV_DIR, fileName);
    } catch (error) {
      this.errorHandler.logError(
        error,
        "getEnvFilePath",
        "Failed to get environment file path"
      );
      throw error;
    }
  }
}
