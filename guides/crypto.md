# Crypto

## CryptoUtil Class

The `CryptoUtil` class is the core of this project, providing utility methods for generating cryptographic parameters, encrypting and decrypting data, and managing key derivation.

### Dependencies

```typescript
import * as argon2 from "argon2";
import CryptoJS from "crypto-js";
import * as crypto from "crypto";
import type * as cryptoTypes from "../models/cryptoTypes";
import * as cryptoConfig from "../config/crypto-config.json";
import { FileEncoding } from "../config/app.settings";
import ConstantsConfig from "../config/constantsConfig";
import ErrorHandler from "../helpers/errorHandler";
```

### Key Features of `CryptoUtil`

#### 3.1 Generate Secure Parameters

The `CryptoUtil` class provides methods to generate cryptographically secure initialization vectors (IVs), salts, secret keys, and message authentication codes (MAC).

- **Generate IV (Initialization Vector)**
  - `generateIvAsBase64`: Generates an IV as a base64 string.
  - `generateIvAsBuffer`: Generates an IV as a Buffer.

- **Generate Salt**
  - `generateSalt`: Generates a cryptographically secure salt in base64 format.

- **Generate Secret Key**
  - `generateSecretKey`: Generates a secure random key for encryption.

#### 3.2 Key Derivation Using Argon2

The class supports key derivation using Argon2, a modern password hashing algorithm, to securely derive keys from a secret key and salt.

```typescript
public static async deriveKeyWithArgon2(
  secretKey: string,
  salt: string
): Promise<CryptoJS.lib.WordArray> {
  const options = {
    type: argon2.argon2id,
    hashLength: cryptoConfig.PARAMETER_LENGTHS.HASH_LENGTH,
    salt: Buffer.from(salt, this.BASE_64),
    memoryCost: ConstantsConfig.getMemoryCost(),
    timeCost: cryptoConfig.KEY_DERIVATION.TIME_COST,
    parallelism: cryptoConfig.KEY_DERIVATION.PARALLELISM,
  };

  const derivedKey = await argon2.hash(secretKey, options);
  return CryptoJS.enc.Base64.parse(derivedKey);
}
```

#### 3.3 Encrypt and Decrypt Data

The `CryptoUtil` class provides methods for encrypting and decrypting data using AES, ensuring that the encryption is done securely with proper handling of IVs, keys, and cipher text.

- **Encrypt Data**

```typescript
public static encryptData(
  value: string,
  key: CryptoJS.lib.WordArray,
  iv: string
): string {
  try {
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
```

- **Decrypt Data**

```typescript
public static decryptData(
  decodedCipherText: CryptoJS.lib.WordArray,
  key: CryptoJS.lib.WordArray,
  decodedIv: CryptoJS.lib.WordArray
) {
  try {
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
```

#### 3.4 Message Authentication Code (MAC)

The class also provides a method for generating and verifying MACs using HMAC-SHA256 to ensure the integrity and authenticity of the encrypted data.

- **Generate MAC**

```typescript
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
```

- **Verify MAC**

```typescript
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
```

## 4. Conclusion

This implementation provides a comprehensive cryptographic utility for generating secure keys, encrypting and decrypting data, and ensuring the integrity of the data with MAC. The environment configuration and global setup classes make it easy to load and manage environment variables securely throughout the project.

