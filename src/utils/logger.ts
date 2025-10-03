import winston from "winston";
import config from "@/config";

// Define colors for log levels
winston.addColors({
    error: "red",
    warn: "yellow",
    info: "cyan",
    debug: "magenta",
    http: "green"
});

// Helper function to format metadata in a clean, readable way
const formatMetadata = (meta: Record<string, any>): string => {
    const entries = Object.entries(meta);
    if (entries.length === 0) return "";

    const parts = entries.map(([key, value]) => {
        // Format different types appropriately
        if (typeof value === "object" && value !== null) {
            return `${key}=${JSON.stringify(value)}`;
        }
        return `${key}=${value}`;
    });

    return parts.join(" ");
};

// Pretty console format for development (human-readable with colors and structure)
const prettyConsoleFormat = winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, service, version, stack, ...meta }) => {
        // Remove timestamp from meta since we display it separately
        const { timestamp: _ts, ...cleanMeta } = meta;

        // Color the level
        const colorizer = winston.format.colorize();
        const coloredLevel = colorizer.colorize(level, level.toUpperCase().padEnd(5));

        // Build the base log line
        let logLine = `${timestamp} ${coloredLevel} [${service}] ${message}`;

        // Add metadata if present
        const metaStr = formatMetadata(cleanMeta);
        if (metaStr) {
            logLine += ` | ${metaStr}`;
        }

        // Add stack trace for errors
        if (stack) {
            logLine += `\n${stack}`;
        }

        return logLine;
    })
);

// Simplified console format (still readable but more compact)
const simpleConsoleFormat = winston.format.combine(
    winston.format.timestamp({ format: "HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const colorizer = winston.format.colorize();
        const coloredLevel = colorizer.colorize(level, level.toUpperCase().padEnd(5));

        // Remove default meta that's not relevant for display
        const { service, version, timestamp: _ts, ...cleanMeta } = meta;

        let logLine = `${timestamp} ${coloredLevel} ${message}`;

        // Add compact metadata
        const metaStr = formatMetadata(cleanMeta);
        if (metaStr) {
            logLine += ` | ${metaStr}`;
        }

        return logLine;
    })
);

// JSON format for production (machine-readable, structured)
const jsonFormat = winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DDTHH:mm:ss.SSSZ" }), // ISO 8601
    winston.format.errors({ stack: true }),
    winston.format.json()
);

// Choose format based on environment and LOG_FORMAT configuration
const getConsoleFormat = () => {
    // Explicit JSON format override
    if (config.logging.format === "json") {
        return jsonFormat;
    }

    // Explicit simple format override
    if (config.logging.format === "simple") {
        return simpleConsoleFormat;
    }

    // Production always uses JSON
    if (config.nodeEnv === "production") {
        return jsonFormat;
    }

    // Development uses pretty format by default
    if (config.nodeEnv === "development") {
        return prettyConsoleFormat;
    }

    // For other environments (test, staging), use simple format
    return simpleConsoleFormat;
};

// Create the logger instance
const logger = winston.createLogger({
    level: config.logging.level,
    defaultMeta: {
        service: config.serviceName,
        version: config.serviceVersion,
        environment: config.nodeEnv
    },
    transports: [
        new winston.transports.Console({
            format: getConsoleFormat(),
            handleExceptions: true,
            handleRejections: true
        })
    ],
    exitOnError: false
});

// Add file transport for production (always JSON format, no colors)
if (config.nodeEnv === "production") {
    logger.add(
        new winston.transports.File({
            filename: "logs/error.log",
            level: "error",
            format: jsonFormat,
            handleExceptions: true
        })
    );
    logger.add(
        new winston.transports.File({
            filename: "logs/combined.log",
            format: jsonFormat,
            handleExceptions: true
        })
    );
}

// Helper methods for structured logging patterns
export const loggers = {
    // HTTP request logging
    http: (method: string, url: string, statusCode: number, duration: number, meta?: Record<string, any>) => {
        logger.info(`${method} ${url}`, {
            type: "http_request",
            method,
            url,
            statusCode,
            duration,
            ...meta
        });
    },

    // Database operation logging
    database: (operation: string, table: string, duration: number, meta?: Record<string, any>) => {
        logger.info(`DB ${operation}`, {
            type: "database",
            operation,
            table,
            duration,
            ...meta
        });
    },

    // External API call logging
    externalApi: (service: string, endpoint: string, statusCode: number, duration: number, meta?: Record<string, any>) => {
        logger.info(`API ${service}`, {
            type: "external_api",
            service,
            endpoint,
            statusCode,
            duration,
            ...meta
        });
    },

    // Performance/metrics logging
    performance: (metric: string, value: number, unit: string, meta?: Record<string, any>) => {
        logger.info(`Performance: ${metric}`, {
            type: "performance",
            metric,
            value,
            unit,
            ...meta
        });
    },

    // Security event logging
    security: (event: string, severity: "low" | "medium" | "high" | "critical", meta?: Record<string, any>) => {
        const logLevel = severity === "critical" || severity === "high" ? "error" : "warn";
        logger[logLevel](`Security: ${event}`, {
            type: "security",
            event,
            severity,
            ...meta
        });
    },

    // Business logic logging
    business: (action: string, entity: string, meta?: Record<string, any>) => {
        logger.info(`Business: ${action}`, {
            type: "business",
            action,
            entity,
            ...meta
        });
    }
};

export default logger;
