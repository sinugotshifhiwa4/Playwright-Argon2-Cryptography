# Winston Logger Utility Guide

This guide provides detailed information about setting up and using a custom Winston logger utility for logging in a Node.js application. The implementation includes custom log formats, transports, and a singleton logger instance.

## Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Custom Logger Features](#custom-logger-features)
4. [Logger Implementation](#logger-implementation)
5. [Level Filtering in File Loggers](#level-filtering-in-file-loggers)
6. [Usage Example](#usage-example)

---

## Overview

The logger utility leverages [Winston](https://github.com/winstonjs/winston) for flexible and feature-rich logging. It includes the following features:

- Custom log formats
- Multiple log levels: `info`, `warn`, `error`, and `debug`
- Console and file-based logging
- Customizable timestamp with timezone
- Singleton design for consistent logging throughout the application

---

## Installation

To integrate the Winston logger into your project, install the required dependencies:

```bash
npm install winston moment-timezone
```

---

## Custom Logger Features

### Log Levels

The logger supports the following levels:

- **info**: General application information
- **warn**: Warning messages
- **error**: Error messages
- **debug**: Debugging information

### Transports

- **File Transports**: Separate log files for each log level.
- **Console Transport**: Logs messages to the console with color-coded levels.

### Formats

- **Custom Timestamp**: Logs include timestamps in ISO 8601 format with timezone.
- **Custom Message Format**: `[timestamp] [level]: message`.

### Singleton Pattern

The `WinstonLogger` class ensures a single logger instance is used throughout the application.

---

## Logger Implementation

The implementation is divided into the following parts:

### 1. Logger Utility (`LoggerUtils`)

The `LoggerUtils` class provides helper methods for creating custom formats, transports, and managing directories.

#### Custom Log Format

```typescript
public static logCustomFormat() {
  return winston.format.printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}]: ${message}`;
  });
}
```

#### Timestamp Format

```typescript
public static customTimestampFormat() {
  return winston.format.timestamp({
    format: () => moment().tz(WinstonLoggerConfig.TIME_ZONE).format(WinstonLoggerConfig.DATE_FORMAT),
  });
}
```

#### Base File Transport

Creates file-based transports:

```typescript
private static baseFileTransport(
  level: string,
  filePath: string,
  timestampFormat: winston.Logform.Format,
  customFormat: winston.Logform.Format,
  loggingDir: string
) {
  return new winston.transports.File({
    filename: this.resolvePath(loggingDir, filePath),
    maxsize: ConstantsConfig.getLoggerMaxSize(),
    level,
    format: winston.format.combine(timestampFormat, customFormat),
  });
}
```

#### Directory Management

Ensures log directory exists:

```typescript
public static ensureDirExists(path: string): void {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
  }
}
```

### 2. Winston Logger (`WinstonLogger`)

The `WinstonLogger` class extends `LoggerUtils` and implements the singleton logger instance.

#### Logger Initialization

Initializes the logger with multiple transports:

```typescript
private static initializeLogger(): void {
  const loggerDir = this.resolvePath(process.cwd(), WinstonLoggerConfig.DIR_PATH);
  this.ensureDirExists(loggerDir);

  const customFormat = this.logCustomFormat();
  const timestampFormat = this.customTimestampFormat();

  const infoTransport = this.createInfoTransport(timestampFormat, customFormat, loggerDir);
  const errorTransport = this.createErrorTransport(timestampFormat, customFormat, loggerDir);
  const warnTransport = this.createWarnTransport(timestampFormat, customFormat, loggerDir);
  const debugTransport = this.createDebugTransport(timestampFormat, customFormat, loggerDir);
  const consoleTransport = this.createConsoleTransport(timestampFormat, customFormat);

  this.instance = this.createLogger(infoTransport, errorTransport, warnTransport, debugTransport, consoleTransport);
}
```

---

## Level Filtering in File Loggers

In Winston, the **level filter** ensures logs of specific levels are directed to their respective file transports. Each transport is configured with a `level` property that determines the highest severity level it will handle.

### File Transport Configuration

Each log level (`info`, `warn`, `error`, `debug`) has its own transport with a designated log file path. For instance:

```typescript
new winston.transports.File({
  filename: 'log_info.log',
  level: 'info', // Handles only 'info' logs
});
```

### Level Filtering Behavior

Winston checks the `level` property of each transport and routes logs accordingly:

- `info` logs go to `log_info.log`.
- `warn` logs go to `log_warn.log`.
- `error` logs go to `log_error.log`.
- `debug` logs go to `log_debug.log`.

Logs of other levels are ignored by a transport unless explicitly configured to include them.

### Console Transport Example

A console transport might be configured to handle multiple levels for real-time feedback:

```typescript
new winston.transports.Console({
  level: 'debug', // Includes all logs from 'debug' and higher levels
});
```

By using this level-based filtering, you can effectively separate logs into specific files for better management and analysis.

---

## Usage Example

### Import and Configure Logger

```typescript
import logger from './loggerUtils';

logger.info('Application started');
logger.error('An error occurred');
logger.debug('Debugging information');
```

### Configuration Example

Set the configuration values in `app.settings.ts`:

```typescript
export const WinstonLoggerConfig = {
  DIR_PATH: 'logs',
  TIME_ZONE: 'Africa/Johannesburg',
  DATE_FORMAT: 'YYYY-MM-DDTHH:mm:ssZ',
  INFO_LOG_LEVEL: 'info',
  WARN_LOG_LEVEL: 'warn',
  ERROR_LOG_LEVEL: 'error',
  DEBUG_LOG_LEVEL: 'debug',
  INFO_FILE_PATH: 'info.log',
  WARN_FILE_PATH: 'warn.log',
  ERROR_FILE_PATH: 'error.log',
  DEBUG_FILE_PATH: 'debug.log',
};
```

---

## Conclusion

The Winston logger utility provides a robust and customizable solution for managing application logs. By using this guide, you can ensure consistent and reliable logging across your project. For more advanced features, refer to the [Winston documentation](https://github.com/winstonjs/winston).

