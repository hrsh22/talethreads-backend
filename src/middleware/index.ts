import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import logger from "@/utils/logger";

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
    const start = Date.now();
    const requestId = uuidv4();

    // Add request ID to headers
    req.headers["x-request-id"] = requestId;
    res.setHeader("X-Request-ID", requestId);

    // Log the incoming request
    logger.info("Incoming request", {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
        requestId
    });

    // Log the response when it finishes
    res.on("finish", () => {
        const duration = Date.now() - start;
        logger.info("Request completed", {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            requestId
        });
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
