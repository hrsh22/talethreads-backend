import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import config from "@/config";
import logger from "@/utils/logger";
import { requestLogger, addSecurityHeaders, errorHandler, notFoundHandler } from "@/middleware";
import routes from "@/routes";

const app = express();

// Trust proxy (for accurate IP addresses behind load balancers)
app.set("trust proxy", 1);

// Security middleware
app.use(helmet());
app.use(addSecurityHeaders);

// CORS configuration
app.use(
    cors({
        origin: config.corsOrigins,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization", "X-Request-ID"]
    })
);

// Rate limiting
const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: {
        success: false,
        error: {
            code: "TOO_MANY_REQUESTS",
            message: "Too many requests from this IP, please try again later"
        },
        timestamp: new Date().toISOString()
    },
    standardHeaders: true,
    legacyHeaders: false
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Compression
app.use(compression());

// Request logging
app.use(requestLogger);

// Routes
app.use("/", routes);

// 404 handler (must be after all routes)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Graceful shutdown handling
process.on("SIGTERM", () => {
    logger.info("SIGTERM received, shutting down gracefully");
    process.exit(0);
});

process.on("SIGINT", () => {
    logger.info("SIGINT received, shutting down gracefully");
    process.exit(0);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error: Error) => {
    logger.error("Uncaught Exception:", error);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
    logger.error("Unhandled Rejection at:", promise, "reason:", reason);
    process.exit(1);
});

export default app;
