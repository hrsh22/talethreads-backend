import { Request, Response, NextFunction } from "express";
import { ErrorResponse } from "@/types";
import logger from "@/utils/logger";
import config from "@/config";

export interface AppError extends Error {
    statusCode?: number;
    code?: string;
    isOperational?: boolean;
}

export class CustomError extends Error implements AppError {
    public statusCode: number;
    public code: string;
    public isOperational: boolean;

    constructor(message: string, statusCode: number = 500, code: string = "INTERNAL_ERROR", isOperational: boolean = true) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = isOperational;

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
    const error = new CustomError(`Route ${req.originalUrl} not found`, 404, "ROUTE_NOT_FOUND");
    next(error);
};

export const errorHandler = (error: AppError, req: Request, res: Response, _next: NextFunction): void => {
    let { statusCode = 500, message, code = "INTERNAL_ERROR" } = error;

    // Handle known error types
    if (error.name === "ValidationError") {
        statusCode = 400;
        code = "VALIDATION_ERROR";
    } else if (error.name === "CastError") {
        statusCode = 400;
        code = "INVALID_ID";
        message = "Invalid ID format";
    } else if (error.name === "JsonWebTokenError") {
        statusCode = 401;
        code = "INVALID_TOKEN";
        message = "Invalid token";
    } else if (error.name === "TokenExpiredError") {
        statusCode = 401;
        code = "TOKEN_EXPIRED";
        message = "Token expired";
    }

    const errorResponse: ErrorResponse = {
        success: false,
        error: {
            code,
            message,
            ...(config.nodeEnv === "development" && { stack: error.stack })
        },
        timestamp: new Date().toISOString(),
        requestId: req.headers["x-request-id"] as string
    };

    // Log the error
    logger.error("Error occurred", {
        error: {
            message: error.message,
            stack: error.stack,
            statusCode,
            code
        },
        request: {
            method: req.method,
            url: req.originalUrl,
            ip: req.ip,
            userAgent: req.get("User-Agent")
        },
        requestId: req.headers["x-request-id"]
    });

    res.status(statusCode).json(errorResponse);
};
