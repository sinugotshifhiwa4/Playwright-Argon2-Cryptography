/**
 * Represents the parameters required for encryption.
 */
export type EncryptionParams = {
    salt: string;
    iv: string;
    cipherText: string;
    mac: string;
  }