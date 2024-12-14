import { test } from "@playwright/test";
import CryptoManager from "../../src/crypto/cryptoManager";
import { EnvironmentFilePathsMap } from "../../src/config/environment.config";
import ENV from "../../src/utils/envVariables";
import logger from "../../src/utils/winstonLogger";

test.describe("Encrypt Credentials Test Suite", () => {
  test(`Encrypt Credentials`, async () => {
    await CryptoManager.encryptEnvironmentVariables(
      EnvironmentFilePathsMap.uat,
      ENV.UAT_SECRET_KEY
    );
    logger.info(`Credentials encrypted successfully`);
  });
});
