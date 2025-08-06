import { Router, Request, Response } from "express";
import { HealthCheckResponse } from "@/types";
import config from "@/config";

const router = Router();

router.get("/", (req: Request, res: Response) => {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    const memoryUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
    const memoryTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
    const memoryPercentage = Math.round((memoryUsedMB / memoryTotalMB) * 100);

    const healthCheck: HealthCheckResponse = {
        status: "healthy",
        version: config.serviceVersion,
        timestamp: new Date().toISOString(),
        uptime: Math.floor(uptime),
        checks: {
            memory: {
                used: memoryUsedMB,
                free: memoryTotalMB - memoryUsedMB,
                percentage: memoryPercentage
            }
        }
    };

    res.status(200).json(healthCheck);
});

router.get("/ready", (req: Request, res: Response) => {
    // Add readiness checks here (database, external services, etc.)
    res.status(200).json({
        status: "ready",
        timestamp: new Date().toISOString()
    });
});

router.get("/live", (req: Request, res: Response) => {
    // Add liveness checks here
    res.status(200).json({
        status: "alive",
        timestamp: new Date().toISOString()
    });
});

export default router;
