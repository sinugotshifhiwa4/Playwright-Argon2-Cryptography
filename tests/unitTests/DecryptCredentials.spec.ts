import { test } from "@playwright/test";
import CryptoService from "../../src/crypto/cryptoService";
import ENV from "../../src/utils/envVariables";
import logger from "../../src/utils/winstonLogger";

test.describe("Decrypt Credentials Test Suite", () => {
  test(`Decrypt Credentials`, async () => {
    // decrypt and log decrypted credentials
    const DecryptedPortalUsername = await CryptoService.decrypt(
      ENV.PORTAL_USERNAME,
      ENV.UAT_SECRET_KEY
    );
    const DecryptedPortalPassword = await CryptoService.decrypt(
      ENV.PORTAL_PASSWORD,
      ENV.UAT_SECRET_KEY
    );

    console.log(
      `Decrypted credentials are: ${DecryptedPortalUsername} and ${DecryptedPortalPassword}`
    );
    logger.info(`Credentials decrypted successfully`);
  });
});
