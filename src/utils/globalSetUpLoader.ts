import GlobalEnvConfig from "./globalEnvConfig";
import ErrorHandler from "../helpers/errorHandler";

// Create an instance of ErrorHandler
const errorHandler: ErrorHandler = new ErrorHandler();

/**
 * Initializes the environment configuration by calling GlobalEnvConfig.initEnvConfiguration().
 * If any error occurs during the setup process, logs the error and throws an exception.
 * @returns {Promise<void>} A promise that resolves when the setup is complete.
 */
async function globalSetupLoader(): Promise<void> {
  try {
    await GlobalEnvConfig.initEnvConfiguration();
  } catch (error) {
    errorHandler.logError(
      error,
      "globalSetup",
      "Failed to set up environment variables"
    );
    throw error;
  }
}

export default globalSetupLoader;
