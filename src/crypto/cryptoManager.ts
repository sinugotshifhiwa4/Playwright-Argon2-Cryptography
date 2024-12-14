import EncryptionHandler from "./encryptionHandler";
import ErrorHandler from "../helpers/errorHandler";

export default class CryptoManager {
  // Create an instance of errorHandler
  private static errorHandler: ErrorHandler = new ErrorHandler();

  // Create an instance of encryptionHandler
  private static encryptionHandler: EncryptionHandler = new EncryptionHandler();

  /**
   * Generates a cryptographically secure random secret key of the default length.
   *
   * This method delegates to the EncryptionHandler and logs any errors that occur.
   *
   * @returns The generated secret key as a base64 string or undefined if an error occurs.
   * @throws {Error} If an error occurs during key generation.
   */
  private static generateSecretKey() {
    try {
      return this.encryptionHandler.generateSecretKey();
    } catch (error) {
      this.errorHandler.logError(error, "generateSecretKey");
      throw error;
    }
  }

  /**
   * Generates and stores a cryptographically secure random secret key in the environment file.
   *
   * This method generates a secret key using the generateSecretKey method and stores it in the
   * .env file with the specified key name. If the secret key is null or undefined, an error is logged
   * and thrown. Logs any errors that occur during the process.
   *
   * @param keyName - The name of the key under which to store the generated secret key in the .env file.
   * @throws {Error} If the secret key generation fails or an error occurs while storing the key.
   */
  public static generateAndStoreSecretKey(keyName: string) {
    try {
      // Call the generateSecretKey method to generate a secret key
      const secretKey = this.generateSecretKey();

      if (secretKey === undefined || secretKey === null) {
        this.errorHandler.logThrowError(
          "Failed to generate secret key, Secret key cannot be null or undefined"
        );
      }

      // Store the generated secret key in the .env file
      this.encryptionHandler.storeBaseEnvKey(keyName, secretKey);
    } catch (error) {
      this.errorHandler.logError(error, "storeSecretKey");
      throw error;
    }
  }

  /**
   * Encrypts environment variables for a specified environment using a provided secret key.
   *
   * This method initializes the encryption process by setting the environment file path and
   * deriving the secret key. Then, it encrypts the environment variables and stores them in
   * the environment file. If an error occurs during the encryption process, logs the error
   * and throws an exception.
   *
   * @param env - The name of the environment to encrypt variables for.
   * @param secretKey - The secret key used for key derivation and encryption.
   * @throws {Error} If an error occurs during the encryption process.
   */
  public static async encryptEnvironmentVariables(
    env: string,
    secretKey: string
  ) {
    try {
      // initialize encryption
      this.encryptionHandler.initializeEncryption(env, secretKey);

      // encrypt environment variables
      await this.encryptionHandler.encryptEnvVariables();
    } catch (error) {
      this.errorHandler.logError(
        error,
        "encryptEnvironmentVariables",
        "Failed to encrypt environment variables"
      );
      throw error;
    }
  }
}
