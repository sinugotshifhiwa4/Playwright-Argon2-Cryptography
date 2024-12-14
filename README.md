
```markdown
# Playwright-Argon2-Cryptography

## Overview
This project integrates cryptographic solutions using Argon2 for password hashing with Playwright automation for UI testing. The modular architecture features reusable components, robust configuration settings, and centralized error handling. TypeScript is used for type safety and maintainability.

### Keywords:
- `playwright`
- `typescript`
- `argon2`
- `crypto-js`
- `encryption`
- `decryption`
- `hashing`
- `logging`
- `winston`
- `dotenv`
- `cross-env`
- `reporting`
- `playwright-report`
- `ortoni-report`
- `error-handling`
- `centralized-error-handling`
- `eslint`

## Project Structure

### Configurations

#### `app-settings.ts`
Contains core configurations such as encoding and Winston logging settings:

- **FileEncoding Enum**: Specifies supported file encodings (`UTF8`, `BASE64`, `ASCII`, `HEX`).
- **WinstonLoggerConfig Enum**: Defines logging parameters, such as time zone, date format, log levels, and log file paths.

#### `crypto-config.json`
Defines cryptographic parameters:
- `IV_LENGTH`, `SALT_LENGTH`, `SECRET_KEY_LENGTH`, and `HASH_LENGTH` for encryption.
- Key derivation settings: `TIME_COST`, `PARALLELISM`.

#### `constants-config.ts`
Stores constants like Argon2 memory cost and maximum log file size, encapsulated via `get` methods for immutability.

### Logging Setup
The project uses Winston for efficient and categorized logging. Log levels (`error`, `info`, `debug`, `warn`) map to specific files, reducing redundancy and enhancing traceability.

### Centralized Error Handling
A utility standardizes error management:
- **Log and Throw**: Logs and throws errors for caller handling.
- **Log Only**: Logs without disrupting flow.
This ensures clear error reporting and simplifies debugging.

### Utility Helper Class
Provides reusable file management functions:
- Reading and writing files.
- Checking file or directory existence.
- Ensuring necessary directories/files are created.
- Resolving paths dynamically.

## Dependencies
- `playwright`: Browser automation.
- `argon2`: Password hashing and cryptography.
- `crypto-js`: Encryption/decryption.
- `winston`: Scalable logging.
- `dotenv`: Environment variable management.
- `cross-env`: Platform-independent environment variable setup.
- `playwright-report`: Test reporting.
- `ortoni-report`: Additional reporting.
- `eslint`: Code quality checks.

---

# Core Features

## 1. Encryption Parameters
The `EncryptionParams` type structures cryptographic data:

```typescript
export type EncryptionParams = {
  salt: string;         // Salt used in encryption
  iv: string;           // Initialization Vector
  cipherText: string;   // Encrypted data
  mac: string;          // Message Authentication Code
};
```

## 2. Environment Configuration for Playwright Tests

### Overview
The environment setup ensures correct loading of variables through:
1. **Global Setup Loader** (`globalSetupLoader.ts`)
2. **Global Environment Configuration** (`globalEnvConfig.ts`)
3. **Playwright Configuration** (`playwright.config.ts`)
4. **Environment Variables Class** (`ENV.ts`)

### **Global Environment Configuration (`globalEnvConfig.ts`):**
Handles environment setup:
- Verifies existence of environment directories/files.
- Loads `.env` and environment-specific files (e.g., `.env.dev`).
- Handles errors during configuration.

### **Global Setup Loader (`globalSetUpLoader.ts`):**
Entry point for environment setup:

```typescript
import GlobalEnvConfig from "./globalEnvConfig";
import ErrorHandler from "../helpers/errorHandler";

const errorHandler: ErrorHandler = new ErrorHandler();

async function globalSetupLoader(): Promise<void> {
  try {
    await GlobalEnvConfig.initEnvConfiguration();
  } catch (error) {
    errorHandler.logError(error, "globalSetup", "Failed to set up environment variables");
    throw error;
  }
}

export default globalSetupLoader;
```

### **Playwright Configuration (`playwright.config.ts`):**
Configures global setup:

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  timeout: 45 * 1000,
  expect: {
    timeout: 45 * 1000,
  },
  testDir: './tests',
  globalSetup: "./src/utils/globalSetUpLoader.ts",
});
```

### **Environment Variables Class (`ENV.ts`):**
Defines key environment variables:

```typescript
export default class ENV {
  public static PORTAL_URL = process.env.PORTAL_URL!;
  public static PORTAL_USERNAME = process.env.PORTAL_USERNAME!;
  public static PORTAL_PASSWORD = process.env.PORTAL_PASSWORD!;
  public static DEV_SECRET_KEY = process.env.DEV_SECRET_KEY!;
  public static UAT_SECRET_KEY = process.env.UAT_SECRET_KEY!;
}
```

---

## 3. `CryptoUtil` Class

Handles encryption, decryption, and key management:

### Key Features

#### Generate Secure Parameters
- **IVs**: Base64 and buffer formats.
- **Salt**: Cryptographically secure in Base64.
- **Secret Key**: Randomly generated.

#### Key Derivation with Argon2
Derives secure keys using Argon2:

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

#### Encrypt and Decrypt Data
Encrypts data securely with AES:

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

---

## Playwright Setup Guide

### Prerequisites
- Node.js (16+)
- npm
- Git

### Initial Setup
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```
2. Remove `package-lock.json` to prevent conflicts.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

### Linting Configuration
Uses ESLint with TypeScript:

```javascript
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: ".",
      },
    },
    rules: {
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/await-thenable": "error",
    },
  }
);
```

### Scripts
Key `package.json` scripts:

```json
"scripts": {
  "pretest:uat": "tsc --noEmit && eslint tests/**",
  "test:uat": "cross-env ENV=uat npx playwright test --project=chromium"
}
```

### Environment Setup Process
1. Ensure `envs/` directory exists with `.env` files.
2. Set `ENV` variable:
   ```bash
   export ENV=uat
   ```
3. Run tests:
   ```bash
   npm run test:uat
   ```



# Project Test Workflow

For this project, some tests depend on other tests, and the sequence of execution is crucial. The following steps should be followed in order to ensure that all processes are tested correctly:

## Step 1: Validate Environment Loader

Before running any other tests, ensure the environment configuration files are loaded properly. This is achieved by running the `ValidateEnvLoader.spec` test.

**Command:**
```
C:\PERSONAL_PROJECTS\Playwright-Crypto\Forge-Argon2\tests\unitTests\ValidateEnvLoader.spec
```

This will verify that the environment files are being loaded correctly.

## Step 2: Generate Secret Key

Once the environment is validated, generate the secret key by running the `GenerateSecretKey.spec.ts` test. This step will create the secret key and store it for subsequent encryption operations.

**Command:**
```
run GenerateSecretKey.spec.ts
```

## Step 3: Encrypt Credentials

Next, run the `EncryptCredentials.spec.ts` test to encrypt the data using the generated secret key for the specific environment. This step ensures that the encryption works as expected.

**Command:**
```
run EncryptCredentials.spec.ts
```

## Step 4: Decrypt Credentials

Finally, run the `DecryptCredentials.spec.ts` test to ensure that decryption works as expected using the previously encrypted credentials.

**Command:**
```
run DecryptCredentials.spec.ts
```

By following this sequence, you will be able to validate the full encryption and decryption process in your project.
```