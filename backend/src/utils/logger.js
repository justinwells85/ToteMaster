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
  }

  /**
   * Formats a log message with timestamp and level
   */
  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const color = this.enableColors ? LOG_COLORS[level] : '';
    const reset = this.enableColors ? LOG_COLORS.RESET : '';

    let formatted = `${color}[${timestamp}] [${level}]${reset} ${message}`;

    if (Object.keys(meta).length > 0) {
      formatted += ` ${JSON.stringify(meta)}`;
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
    const meta = {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
    };

    const level = res.statusCode >= 400 ? 'WARN' : 'INFO';
    this[level.toLowerCase()](`HTTP ${req.method} ${req.path}`, meta);
  }
}

// Export singleton instance
export default new Logger();
