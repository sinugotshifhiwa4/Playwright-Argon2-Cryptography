export default class ENV {
  // Portal environment variables

  /*
   * @ Portal Environment Variables
   * @ Description: This class contains all the environment variables required for the portal
   * It can have framework specific environment variables such as api, database, etc.
   */

  // Portal URL
  public static PORTAL_URL = process.env.PORTAL_URL!;

  // Portal credentials
  public static PORTAL_USERNAME = process.env.PORTAL_USERNAME!;
  public static PORTAL_PASSWORD = process.env.PORTAL_PASSWORD!;

  // Secret keys
  public static DEV_SECRET_KEY = process.env.DEV_SECRET_KEY!;
  public static UAT_SECRET_KEY = process.env.UAT_SECRET_KEY!;
}
