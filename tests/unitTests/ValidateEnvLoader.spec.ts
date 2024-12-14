import { test, expect } from "@playwright/test";
import ENV from "../../src/utils/envVariables";
import logger from "../../src/utils/winstonLogger";

test.describe("Environment Loader Validation", () => {
  test(`Load the Portal UR`, async ({ page }) => {
    await page.goto(ENV.PORTAL_URL);

    await expect(page).toHaveURL(ENV.PORTAL_URL);
    await expect(page).toHaveTitle("OrangeHRM");
    logger.info(`Actual page title matches the expected title`);
    logger.info(`Navigated to ${ENV.PORTAL_URL}`);
    logger.info(`Portal URL loaded successfully`);
  });
});
