/**
 * Enum representing environment configurations including file paths and secret keys.
 * Each member corresponds to a specific environment configuration.
 * @enum {string}
 */
export enum EnvironmentConfig {
    ENV_DIR = "envs",
    BASE_ENV_FILE = ".env",
    DEV_ENV_FILE = ".env.dev",
    UAT_ENV_FILE = ".env.uat",
    PROD_ENV_FILE = ".env.prod",
    DEV_SECRET_KEY = "DEV_SECRET_KEY",
    UAT_SECRET_KEY = "UAT_SECRET_KEY",
    PROD_SECRET_KEY = "PROD_SECRET_KEY",
  }
  
  /**
   * Type safety representing possible environment stages.
   * This type restricts values to 'dev', 'uat', or 'prod'.
   * @typedef {('dev' | 'uat' | 'prod')} EnvironmentStage
   */
  type EnvironmentStage = "dev" | "uat" | "prod";
  
  /**
   * Mapping of environment stages to corresponding environment file paths.
   * This mapping is used to select the appropriate environment configuration.
   * @type {Record<EnvironmentStage, string>}
   */
  export const EnvironmentFilePathsMap: Record<EnvironmentStage, string> = {
    dev: EnvironmentConfig.DEV_ENV_FILE,
    uat: EnvironmentConfig.UAT_ENV_FILE,
    prod: EnvironmentConfig.PROD_ENV_FILE,
  };