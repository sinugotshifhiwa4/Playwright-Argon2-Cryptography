import CryptoJS from "crypto-js";
import CryptoUtil from "./cryptoUtil";
import type * as cryptoTypes from "../models/cryptoTypes";

export default class CryptoService extends CryptoUtil {
  /**
   * Encrypts the given value using a provided secret key.
   *
   * This method generates a random salt and initialization vector (IV),
   * derives a key using Argon2, encrypts the value, and generates a
   * message authentication code (MAC) for integrity verification.
   *
   * @param value - The plaintext value to encrypt.
   * @param secretKey - The secret key used for key derivation.
   * @returns A promise that resolves to an object containing the salt, IV, ciphertext, and MAC.
   * @throws {Error} If an error occurs during the encryption process.
   */
  public static async encrypt(
    value: string,
    secretKey: string
  ): Promise<cryptoTypes.EncryptionParams> {
    try {
      // Generate a random salt and IV
      const salt = this.generateSalt();
      const iv = this.generateIvAsBase64();

      // Derive a key using Argon2
      const key = await this.deriveKeyWithArgon2(secretKey, salt);

      // Encrypt the value
      const cipherText = this.encryptData(value, key, iv);

      // Generate the MAC
      const mac = this.generateMac(salt, iv, cipherText, key);

      return { salt, iv, cipherText, mac };
    } catch (error) {
      this.errorHandler.logError(
        error,
        "encrypt",
        "Failed to encrypt with Argon2."
      );
      throw error;
    }
  }

  /**
   * Decrypts the given encrypted data using Argon2 and a provided secret key.
   *
   * This method parses the encrypted data to extract the salt, IV, ciphertext, and MAC.
   * It derives a key using Argon2, verifies the MAC to ensure data integrity, and
   * decrypts the ciphertext using the derived key and provided IV.
   *
   * @param encryptedData - The encrypted data in string format to be decrypted.
   * @param secretKey - The secret key used for key derivation.
   * @returns A promise that resolves to the decrypted plaintext string.
   * @throws {Error} If decryption fails or the MAC verification is unsuccessful.
   */
  public static async decrypt(
    encryptedData: string,
    secretKey: string
  ): Promise<string> {
    const parsedData = this.parseEncryptedData(encryptedData);
    const { salt, iv, cipherText, mac } = parsedData;

    try {
      // Derive the key using Argon2
      const key = await this.deriveKeyWithArgon2(secretKey, salt);

      // Verify the MAC
      const computedMac = this.generateMac(
        salt,
        iv,
        cipherText,
        key // Use the derived key directly
      );
      this.verifyMac(computedMac, mac);

      // Decrypt the ciphertext
      const decrypted = this.decryptData(
        CryptoJS.enc.Base64.parse(cipherText),
        key,
        CryptoJS.enc.Base64.parse(iv)
      );

      if (!decrypted) {
        this.errorHandler.logThrowError(
          "Decryption failed. The result is empty or malformed."
        );
      }

      return decrypted;
    } catch (error) {
      this.errorHandler.logError(
        error,
        "decrypt",
        "Failed to decrypt with Argon2."
      );
      throw error;
    }
  }
}
