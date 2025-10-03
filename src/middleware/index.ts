import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import logger from "@/utils/logger";

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
    const start = Date.now();
    const requestId = uuidv4();

    // Add request ID to headers for tracking
    req.headers["x-request-id"] = requestId;
    res.setHeader("X-Request-ID", requestId);

    // Log the response when it finishes
    res.on("finish", () => {
        const duration = Date.now() - start;

        // Determine log level based on status code
        const statusCode = res.statusCode;
        let logLevel: "info" | "warn" | "error" = "info";

        if (statusCode >= 500) {
            logLevel = "error";
        } else if (statusCode >= 400) {
            logLevel = "warn";
        }

        // Get status code emoji for better visual recognition
        const getStatusEmoji = (code: number): string => {
            if (code >= 200 && code < 300) return "✓";
            if (code >= 300 && code < 400) return "→";
            if (code >= 400 && code < 500) return "⚠";
            if (code >= 500) return "✗";
            return "•";
        };

        const emoji = getStatusEmoji(statusCode);
        const message = `${emoji} ${req.method} ${req.originalUrl} ${statusCode}`;

        // Build structured log data
        const logData: Record<string, any> = {
            type: "http_request",
            method: req.method,
            url: req.originalUrl,
            statusCode,
            duration,
            requestId,
            ip: req.ip
        };

        // Add query params if present
        if (Object.keys(req.query).length > 0) {
            logData["query"] = req.query;
        }

        // Add user agent for non-health check endpoints
        if (!req.originalUrl.includes("/health")) {
            logData["userAgent"] = req.get("User-Agent");
        }

        // Add content length if present
        const contentLength = res.get("content-length");
        if (contentLength) {
            logData["responseSize"] = `${contentLength}b`;
        }

        // Log with appropriate level
        logger[logLevel](message, logData);
    });

    next();
};

export const addSecurityHeaders = (_req: Request, res: Response, next: NextFunction): void => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    next();
};

export * from "./error";
