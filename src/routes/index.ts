import { Router } from "express";
import { ApiResponse } from "@/types";
import config from "@/config";
import healthRoutes from "./health";
import apiRoutes from "./api";

const router = Router();

// Health check routes
router.use("/health", healthRoutes);

// Root route
router.get("/", (req, res) => {
    const response: ApiResponse = {
        success: true,
        data: {
            service: config.serviceName,
            version: config.serviceVersion,
            environment: config.nodeEnv,
            message: "Talethreads Backend Service is running",
            endpoints: {
                health: "/health",
                api: "/api/v1"
            }
        },
        timestamp: new Date().toISOString(),
        requestId: req.headers["x-request-id"] as string
    };

    res.json(response);
});

// API versioning
router.use("/api/v1", apiRoutes);

export default router;
