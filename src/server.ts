import app from "./app";
import config from "@/config";
import logger from "@/utils/logger";
import { dbConnection } from "@/db";

const startServer = async (): Promise<void> => {
    try {
        // Add any startup checks here (database connections, etc.)
        logger.info("Starting server initialization...");

        // Initialize database connection
        await dbConnection.connect();

        // TODO: Add Redis connection initialization

        const server = app.listen(config.port, config.host, () => {
            logger.info(`🚀 ${config.serviceName} v${config.serviceVersion} started`, {
                port: config.port,
                host: config.host,
                environment: config.nodeEnv,
                timestamp: new Date().toISOString()
            });

            logger.info(`📋 Health check available at: http://${config.host}:${config.port}/health`);
        });

        // Graceful shutdown
        const gracefulShutdown = (signal: string) => {
            logger.info(`${signal} received, starting graceful shutdown...`);

            server.close((err?: Error) => {
                if (err) {
                    logger.error("Error during server shutdown:", err);
                    process.exit(1);
                }

                logger.info("Server closed successfully");

                // Close database connections here
                dbConnection.disconnect()
                    .then(() => {
                        logger.info("Database connections closed");
                        // TODO: Close Redis connections
                        process.exit(0);
                    })
                    .catch((err) => {
                        logger.error("Error closing database connections:", err);
                        process.exit(1);
                    });
            });

            // Force shutdown after 30 seconds
            setTimeout(() => {
                logger.error("Forced shutdown after timeout");
                process.exit(1);
            }, 30000);
        };

        process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
        process.on("SIGINT", () => gracefulShutdown("SIGINT"));
    } catch (error) {
        logger.error("Failed to start server:", error);
        process.exit(1);
    }
};

// Start the server
startServer().catch(error => {
    logger.error("Server startup failed:", error);
    process.exit(1);
});
