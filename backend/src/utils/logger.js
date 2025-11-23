/**
 * Logger Utility
 * Provides consistent logging throughout the application
 */

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
};

const LOG_COLORS = {
  ERROR: '\x1b[31m', // Red
  WARN: '\x1b[33m',  // Yellow
  INFO: '\x1b[36m',  // Cyan
  DEBUG: '\x1b[35m', // Magenta
  RESET: '\x1b[0m',
};

class Logger {
  constructor() {
    this.level = process.env.LOG_LEVEL || 'INFO';
    this.enableColors = process.env.LOG_COLORS !== 'false';
    this.useJSON = process.env.LOG_FORMAT === 'json';
    this.context = {};
  }

  /**
   * Set context for subsequent logs
   */
  setContext(context) {
    this.context = { ...this.context, ...context };
    return this;
  }

  /**
   * Clear context
   */
  clearContext() {
    this.context = {};
    return this;
  }

  /**
   * Create a child logger with additional context
   */
  child(context) {
    const childLogger = new Logger();
    childLogger.level = this.level;
    childLogger.enableColors = this.enableColors;
    childLogger.useJSON = this.useJSON;
    childLogger.context = { ...this.context, ...context };
    return childLogger;
  }

  /**
   * Formats a log message with timestamp and level
   */
  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const allMeta = { ...this.context, ...meta };

    // JSON format for production/structured logging
    if (this.useJSON) {
      return JSON.stringify({
        timestamp,
        level,
        message,
        ...allMeta,
      });
    }

    // Human-readable format for development
    const color = this.enableColors ? LOG_COLORS[level] : '';
    const reset = this.enableColors ? LOG_COLORS.RESET : '';

    let formatted = `${color}[${timestamp}] [${level}]${reset} ${message}`;

    if (Object.keys(allMeta).length > 0) {
      formatted += ` ${JSON.stringify(allMeta)}`;
    }

    return formatted;
  }

  /**
   * Determines if a log level should be output
   */
  shouldLog(level) {
    const levels = Object.keys(LOG_LEVELS);
    const currentLevelIndex = levels.indexOf(this.level);
    const messageLevelIndex = levels.indexOf(level);

    return messageLevelIndex <= currentLevelIndex;
  }

  /**
   * Log an error message
   */
  error(message, meta = {}) {
    if (this.shouldLog('ERROR')) {
      console.error(this.formatMessage('ERROR', message, meta));
    }
  }

  /**
   * Log a warning message
   */
  warn(message, meta = {}) {
    if (this.shouldLog('WARN')) {
      console.warn(this.formatMessage('WARN', message, meta));
    }
  }

  /**
   * Log an info message
   */
  info(message, meta = {}) {
    if (this.shouldLog('INFO')) {
      console.info(this.formatMessage('INFO', message, meta));
    }
  }

  /**
   * Log a debug message
   */
  debug(message, meta = {}) {
    if (this.shouldLog('DEBUG')) {
      console.debug(this.formatMessage('DEBUG', message, meta));
    }
  }

  /**
   * Log HTTP request
   */
  http(req, res, duration) {
    const fullPath = req.originalUrl || req.url;
    const meta = {
      method: req.method,
      path: fullPath,
      status: res.statusCode,
      duration: `${duration}ms`,
    };

    const level = res.statusCode >= 400 ? 'WARN' : 'INFO';
    this[level.toLowerCase()](`HTTP ${req.method} ${fullPath}`, meta);
  }

  /**
   * Log with error object (includes stack trace)
   */
  logError(message, error, meta = {}) {
    const errorMeta = {
      ...meta,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: error.code,
        details: error.details,
      },
    };
    this.error(message, errorMeta);
  }

  /**
   * Create a timer to measure performance
   */
  startTimer() {
    const start = Date.now();
    return {
      end: (message, meta = {}) => {
        const duration = Date.now() - start;
        this.debug(message, { ...meta, duration: `${duration}ms` });
        return duration;
      },
    };
  }

  /**
   * Log function entry (useful for debugging)
   */
  logFunctionEntry(functionName, params = {}) {
    this.debug(`Entering ${functionName}`, { params });
  }

  /**
   * Log function exit (useful for debugging)
   */
  logFunctionExit(functionName, result = {}) {
    this.debug(`Exiting ${functionName}`, { result });
  }

  /**
   * Log validation failure
   */
  logValidationError(context, errors) {
    this.warn(`Validation failed in ${context}`, { errors });
  }

  /**
   * Log database operation
   */
  logDatabaseOperation(operation, table, meta = {}) {
    this.debug(`Database ${operation} on ${table}`, meta);
  }
}

// Export singleton instance
export default new Logger();
