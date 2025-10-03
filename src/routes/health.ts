import { Router, Request, Response } from "express";
import { HealthCheckResponse } from "@/types";
import config from "@/config";
import { dbConnection, redisConnection } from "@/db";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    const memoryUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
    const memoryTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
    const memoryPercentage = Math.round((memoryUsedMB / memoryTotalMB) * 100);

    // Check database health
    const isDatabaseHealthy = await dbConnection.healthCheck();

    // Check Redis health
    const isRedisHealthy = await redisConnection.healthCheck();

    // Overall status is healthy only if both database and Redis are healthy
    const overallStatus = isDatabaseHealthy && isRedisHealthy ? "healthy" : "unhealthy";

    const healthCheck: HealthCheckResponse = {
        status: overallStatus,
        version: config.serviceVersion,
        timestamp: new Date().toISOString(),
        uptime: Math.floor(uptime),
        checks: {
            database: isDatabaseHealthy ? "connected" : "disconnected",
            redis: isRedisHealthy ? "connected" : "disconnected",
            memory: {
                used: memoryUsedMB,
                free: memoryTotalMB - memoryUsedMB,
                percentage: memoryPercentage
            }
        }
    };

    const statusCode = overallStatus === "healthy" ? 200 : 503;
    res.status(statusCode).json(healthCheck);
});

router.get("/ready", async (_req: Request, res: Response) => {
    // Add readiness checks here (database, external services, etc.)
    const isDatabaseReady = await dbConnection.healthCheck();
    const isRedisReady = await redisConnection.healthCheck();
    const isReady = isDatabaseReady && isRedisReady; // Add other service checks here

    const statusCode = isReady ? 200 : 503;
    res.status(statusCode).json({
        status: isReady ? "ready" : "not ready",
        timestamp: new Date().toISOString(),
        checks: {
            database: isDatabaseReady ? "ready" : "not ready",
            redis: isRedisReady ? "ready" : "not ready"
        }
    });
});

router.get("/live", (_req: Request, res: Response) => {
    // Add liveness checks here
    res.status(200).json({
        status: "alive",
        timestamp: new Date().toISOString()
    });
});

export default router;
