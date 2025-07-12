interface ErrorContext {
  userId?: string;
  route?: string;
  context?: string;
  componentStack?: string;
  extra?: Record<string, any>;
}

interface ErrorLog {
  message: string;
  stack?: string;
  timestamp: number;
  url: string;
  userAgent: string;
  context?: ErrorContext;
  level: 'error' | 'warn' | 'info';
}

interface ErrorLoggerConfig {
  enabled: boolean;
  endpoint?: string;
  maxLogs: number;
  sendInterval: number;
}

const config: ErrorLoggerConfig = {
  enabled: import.meta.env.VITE_ENABLE_ERROR_REPORTING === 'true',
  endpoint: import.meta.env.VITE_ERROR_ENDPOINT,
  maxLogs: 50,
  sendInterval: 30000, // 30 seconds
};

const errorQueue: ErrorLog[] = [];

export const errorLogger = {
  init(): void {
    if (!config.enabled) return;

    // Global error handler
    window.addEventListener('error', (event) => {
      this.logError(event.error || new Error(event.message), {
        context: 'GlobalErrorHandler',
        extra: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.logError(new Error(event.reason), {
        context: 'UnhandledPromiseRejection',
      });
    });

    // Vue error handler (if available)
    if (window.__VUE_APP_ERROR_HANDLER__) {
      window.__VUE_APP_ERROR_HANDLER__ = (error: Error, context?: ErrorContext) => {
        this.logError(error, { ...context, context: 'VueErrorHandler' });
      };
    }

    // Send logs periodically
    setInterval(() => this.sendLogs(), config.sendInterval);

    // Send logs on page unload
    window.addEventListener('beforeunload', () => this.sendLogs(true));
  },

  logError(error: Error, context?: ErrorContext): void {
    const errorLog: ErrorLog = {
      message: error.message,
      stack: error.stack,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      context: {
        route: window.location.pathname,
        ...context,
      },
      level: 'error',
    };

    this.addToQueue(errorLog);
    
    // Console log for development
    if (import.meta.env.DEV) {
      console.error('Error logged:', errorLog);
    }
  },

  logWarning(message: string, context?: ErrorContext): void {
    const errorLog: ErrorLog = {
      message,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      context: {
        route: window.location.pathname,
        ...context,
      },
      level: 'warn',
    };

    this.addToQueue(errorLog);
  },

  logInfo(message: string, context?: ErrorContext): void {
    const errorLog: ErrorLog = {
      message,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      context: {
        route: window.location.pathname,
        ...context,
      },
      level: 'info',
    };

    this.addToQueue(errorLog);
  },

  addToQueue(errorLog: ErrorLog): void {
    errorQueue.push(errorLog);

    // Keep queue size under limit
    if (errorQueue.length > config.maxLogs) {
      errorQueue.splice(0, errorQueue.length - config.maxLogs);
    }
  },

  async sendLogs(immediate = false): Promise<void> {
    if (!config.endpoint || errorQueue.length === 0) return;

    const logsToSend = [...errorQueue];
    
    try {
      const payload = {
        logs: logsToSend,
        sessionId: this.getSessionId(),
        timestamp: Date.now(),
      };

      if (immediate && 'sendBeacon' in navigator) {
        // Use sendBeacon for immediate sending on page unload
        navigator.sendBeacon(
          config.endpoint,
          new Blob([JSON.stringify(payload)], { type: 'application/json' })
        );
      } else {
        await fetch(config.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      }

      // Clear sent logs
      errorQueue.length = 0;
    } catch (error) {
      console.warn('Failed to send error logs:', error);
    }
  },

  getSessionId(): string {
    const key = 'grundstein_session_id';
    let sessionId = sessionStorage.getItem(key);
    
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem(key, sessionId);
    }
    
    return sessionId;
  },

  // Performance logging
  logPerformance(name: string, duration: number, context?: ErrorContext): void {
    if (duration > 1000) { // Log slow operations (>1s)
      this.logWarning(`Slow operation: ${name} took ${duration}ms`, {
        ...context,
        context: 'PerformanceIssue',
        extra: { duration },
      });
    }
  },

  // Network error logging
  logNetworkError(url: string, status: number, message: string): void {
    this.logError(new Error(`Network error: ${message}`), {
      context: 'NetworkError',
      extra: { url, status },
    });
  },

  // Business logic error logging
  logBusinessError(operation: string, details: Record<string, any>): void {
    this.logError(new Error(`Business logic error in ${operation}`), {
      context: 'BusinessLogic',
      extra: details,
    });
  },

  // Get current logs (for debugging)
  getLogs(): ErrorLog[] {
    return [...errorQueue];
  },

  // Clear logs manually
  clearLogs(): void {
    errorQueue.length = 0;
  },
};