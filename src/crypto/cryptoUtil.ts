import * as argon2 from "argon2";
import CryptoJS from "crypto-js";
import * as crypto from "crypto";
import type * as cryptoTypes from "../models/cryptoTypes";
import * as cryptoConfig from "../config/crypto-config.json";
import { FileEncoding } from "../config/app.settings";
import ConstantsConfig from "../config/constantsConfig";
import ErrorHandler from "../helpers/errorHandler";

export default class CryptoUtil {
  // Create an instance of ErrorHandler
  public static errorHandler: ErrorHandler = new ErrorHandler();

  // Set base64 as buffer encoding
  private static BASE_64: BufferEncoding = FileEncoding.BASE64;

  /**
   * Generates a cryptographically secure initialization vector of the specified length as a base64 string.
   * @param length The length of the IV to generate in bytes. Defaults to the default IV length.
   * @returns A base64 string containing a secure IV of the specified length.
   * @throws {Error} If the length is less than or equal to zero.
   * @throws {Error} If an error occurs during IV generation.
   */
  public static generateIvAsBase64(
    length: number = cryptoConfig.PARAMETER_LENGTHS.IV_LENGTH
  ): string {
    if (length <= 0) throw new Error("IV length must be greater than zero.");
    try {
      return crypto.randomBytes(length).toString(this.BASE_64);
    } catch (error) {
      this.errorHandler.logError(
        error,
        "generateIv",
        `Failed to generate IV of length ${length}`
      );
      throw error;
    }
  }

  /**
   * Generates a cryptographically secure initialization vector of the specified length as a Buffer.
   * @param length The length of the IV to generate in bytes. Defaults to the default IV length.
   * @returns A Buffer containing a secure IV of the specified length.
   * @throws {Error} If the length is less than or equal to zero.
   * @throws {Error} If an error occurs during IV generation.
   */
  public static generateIvAsBuffer(
    length: number = cryptoConfig.PARAMETER_LENGTHS.IV_LENGTH
  ): Buffer {
    if (length <= 0) throw new Error("IV length must be greater than zero.");
    try {
      return crypto.randomBytes(length);
    } catch (error) {
      this.errorHandler.logError(
        error,
        "generateIvAsBuffer",
        `Failed to generate IV of length ${length}`
      );
      throw error;
    }
  }

  /**
   * Generates a cryptographically secure random salt of the specified length as a base64 string.
   * @param length The length of the salt to generate in bytes. Defaults to the default salt length.
   * @returns A base64 string containing a secure salt of the specified length.
   * @throws {Error} If an error occurs during salt generation.
   */
  public static generateSalt(
    length: number = cryptoConfig.PARAMETER_LENGTHS.SALT_LENGTH
  ): string {
    if (length <= 0) throw new Error("Salt length must be greater than zero.");
    try {
      return crypto.randomBytes(length).toString(this.BASE_64);
    } catch (error) {
      this.errorHandler.logError(
        error,
        "generateSalt",
        `Failed to generate salt of length ${length}`
      );
      throw error;
    }
  }

  /**
   * Generates a cryptographically secure random key of the specified length as a base64 string.
   * @param length The length of the key to generate in bytes. Defaults to the default key length.
   * @returns A base64 string containing a secure key of the specified length.
   * @throws {Error} If an error occurs during key generation.
   */
  public static generateSecretKey(
    length: number = cryptoConfig.PARAMETER_LENGTHS.SECRET_KEY_LENGTH
  ): string {
    try {
      // Generate a cryptographically secure random key
      return crypto.randomBytes(length).toString(this.BASE_64);
    } catch (error) {
      this.errorHandler.logError(
        error,
        "generateKey",
        "Failed to generate key"
      );
      throw error;
    }
  }

  /**
   * Derives a key using Argon2 from the given secret key and salt.
   * @param secretKey - The secret key to derive the key from.
   * @param salt - The salt to use during the key derivation process.
   * @returns A promise that resolves to a base64-encoded string containing the derived key.
   * @throws Error if an error occurs during key derivation.
   */
  public static async deriveKeyWithArgon2(
    secretKey: string,
    salt: string
  ): Promise<CryptoJS.lib.WordArray> {
    try {
      const options = {
        type: argon2.argon2id,
        hashLength: cryptoConfig.PARAMETER_LENGTHS.HASH_LENGTH,
        salt: Buffer.from(salt, this.BASE_64),
        memoryCost: ConstantsConfig.getMemoryCost(),
        timeCost: cryptoConfig.KEY_DERIVATION.TIME_COST,
        parallelism: cryptoConfig.KEY_DERIVATION.PARALLELISM,
      };

      // Derive the key
      const derivedKey = await argon2.hash(secretKey, options);
      return CryptoJS.enc.Base64.parse(derivedKey);
    } catch (error) {
      this.errorHandler.logError(
        error,
        "deriveKeyWithArgon2",
        "Failed to derive key with Argon2."
      );
      throw error;
    }
  }

  /**
   * Verifies the derived key using Argon2.
   * @param hashedKey - The hashed key to verify.
   * @param plainKey - The plain secret key to verify against.
   * @returns A Promise that resolves to a boolean indicating whether the keys match.
   */
  public static async verifyKeyWithArgon2(
    hashedKey: string,
    plainKey: string
  ): Promise<boolean> {
    try {
      return await argon2.verify(hashedKey, plainKey);
    } catch (error) {
      this.errorHandler.logError(
        error,
        "verifyKeyWithArgon2",
        "Failed to verify key with Argon2."
      );
      throw error;
    }
  }

  /**
   * Encrypts the given value using the given key and initialization vector.
   * @param value The value to encrypt.
   * @param key The key to use for encryption.
   * @param iv The initialization vector to use for encryption.
   * @returns The encrypted value as a string.
   * @throws {Error} If an error occurs during encryption.
   */
  public static encryptData(
    value: string,
    key: CryptoJS.lib.WordArray,
    iv: string
  ): string {
    try {
      // Encrypt the value
      const cipherText = CryptoJS.AES.encrypt(value, key, {
        iv: CryptoJS.enc.Base64.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }).toString();

      return cipherText;
    } catch (error) {
      this.errorHandler.logError(
        error,
        "encryptData",
        "Failed to encrypt text"
      );
      throw error;
    }
  }

  /**
   * Parses the given encrypted data as JSON and validates if the required properties are present.
   * @param encryptedData The encrypted data to parse.
   * @returns The parsed data if successful, otherwise throws an error.
   * @throws {Error} If the encrypted data is empty or if an error occurs during parsing.
   */
  public static parseEncryptedData(encryptedData: string) {
    try {
      if (!encryptedData) {
        this.errorHandler.logThrowError("Encrypted data is required.");
      }

      // Parse the encrypted data as JSON
      const parsedData = JSON.parse(
        encryptedData
      ) as cryptoTypes.EncryptionParams;

      // Validate if the required properties are present
      this.validateParsedData(parsedData);

      return parsedData;
    } catch (error) {
      this.errorHandler.logError(
        error,
        "parseEncryptedData",
        "Failed to parse encrypted data"
      );
      throw error;
    }
  }

  /**
   * Decrypts the given encrypted data using the given key and IV.
   * @param decodedCipherText The encrypted data to decrypt.
   * @param key The key used for encryption.
   * @param decodedIv The initialization vector used for encryption.
   * @returns The decrypted text if successful, otherwise throws an error.
   * @throws {Error} If an error occurs during decryption.
   */
  public static decryptData(
    decodedCipherText: CryptoJS.lib.WordArray,
    key: CryptoJS.lib.WordArray,
    decodedIv: CryptoJS.lib.WordArray
  ) {
    try {
      // Decrypt the ciphertext
      const decryptedBytes = CryptoJS.AES.decrypt(
        { ciphertext: decodedCipherText } as CryptoJS.lib.CipherParams,
        key,
        { iv: decodedIv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
      );

      return decryptedBytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      this.errorHandler.logError(
        error,
        "decryptData",
        "Failed to decrypt text"
      );
      throw error;
    }
  }

  /**
   * Validates the parsed data to ensure all required properties are present.
   *
   * The required properties are salt, iv, cipherText, and mac.
   *
   * @param parsedData - The parsed data to validate.
   * @throws Error - If any of the required properties are missing.
   */
  public static validateParsedData(
    parsedData: cryptoTypes.EncryptionParams
  ): void {
    try {
      const { salt, iv, cipherText, mac } = parsedData;
      if (!salt || !iv || !cipherText || !mac) {
        this.errorHandler.logThrowError(
          `Missing required properties in parsed data.`
        );
      }
    } catch (error) {
      this.errorHandler.logError(
        error,
        "validateParsedData",
        "Failed to validate parsed data."
      );
      throw error;
    }
  }

  /**
   * Generates a message authentication code (MAC) using the HMAC-SHA256 algorithm
   * given the salt, initialization vector, ciphertext, and key.
   *
   * The MAC is generated by concatenating the salt, IV, and ciphertext with colons
   * and then hashing the result using the given key with HMAC-SHA256.
   *
   * @param salt - The salt used for encryption.
   * @param iv - The initialization vector used for encryption.
   * @param cipherText - The encrypted data.
   * @param key - The key used for encryption.
   * @returns The generated MAC as a string.
   */
  public static generateMac(
    salt: string,
    iv: string,
    cipherText: string,
    key: CryptoJS.lib.WordArray
  ): string {
    try {
      return CryptoJS.HmacSHA256(
        `${salt}:${iv}:${cipherText}`,
        key.toString(CryptoJS.enc.Base64)
      ).toString();
    } catch (error) {
      this.errorHandler.logError(
        error,
        "generateMac",
        "Failed to generate MAC."
      );
      throw error;
    }
  }

  /**
   * Verifies that the provided message authentication code (MAC) matches the expected MAC.
   * If the MACs do not match, logs an error indicating a potential data tampering.
   *
   * @param computedMac - The MAC computed from the provided data.
   * @param mac - The expected MAC to compare against.
   * @throws Will log an error and throw an exception if the MAC verification fails.
   */
  public static verifyMac(computedMac: string, mac: string) {
    try {
      if (computedMac !== mac) {
        this.errorHandler.logThrowError(
          "MAC verification failed. The data may have been tampered with."
        );
      }
    } catch (error) {
      this.errorHandler.logError(error, "verifyMac", "Failed to verify MAC");
      throw error;
    }
  }
}
