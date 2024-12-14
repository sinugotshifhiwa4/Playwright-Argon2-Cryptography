import { test } from "@playwright/test";
import CryptoManager from "../../src/crypto/cryptoManager";
import { EnvironmentConfig } from "../../src/config/environment.config";
import logger from "../../src/utils/winstonLogger";

test.describe("Generate Secret Key Test Suite", () => {
  test(`Generate Secret Key`, async () => {
    CryptoManager.generateAndStoreSecretKey(EnvironmentConfig.UAT_SECRET_KEY);
    logger.info(`Secret key generated and stored successfully`);
  });
});
