import winston from "winston";
import config from "@/config";

// Define colors for log levels
winston.addColors({
    error: "red",
    warn: "yellow",
    info: "cyan",
    debug: "magenta"
});

// Custom format for console output with colored log levels
const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, service, version, ...meta }) => {
        const coloredLevel = winston.format.colorize().colorize(level, level.toUpperCase());
        const serviceInfo = { timestamp, service };
        if (Object.keys(meta).length) {
            Object.assign(serviceInfo, meta);
        }
        return `[${coloredLevel}] ${message} ${JSON.stringify(serviceInfo)}`;
    })
);

// JSON format for file outputs (no colors)
const fileFormat = winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.json());

// Choose format based on environment and output type
const getConsoleFormat = () => {
    if (config.logging.format === "json") {
        return fileFormat;
    }
    return consoleFormat;
};

const logger = winston.createLogger({
    level: config.logging.level,
    defaultMeta: {
        service: config.serviceName,
        version: config.serviceVersion
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
            format: fileFormat,
            handleExceptions: true
        })
    );
    logger.add(
        new winston.transports.File({
            filename: "logs/combined.log",
            format: fileFormat,
            handleExceptions: true
        })
    );
}

// Add file transport for development (optional, uncomment to enable)
// if (config.nodeEnv === "development") {
//     logger.add(
//         new winston.transports.File({
//             filename: "logs/dev.log",
//             format: fileFormat,
//             handleExceptions: true
//         })
//     );
// }

export default logger;
