import { Router, Request, Response } from "express";
import { z } from "zod";
import { ApiResponse } from "@/types";
import { validateRequest, commonSchemas } from "@/utils/validation";
import { CustomError } from "@/middleware/error";

const router = Router();

// Example endpoint with validation
const pingSchema = z.object({
    message: z.string().min(1, "Message is required").max(100, "Message too long")
});

router.post("/ping", validateRequest(pingSchema), (req: Request, res: Response) => {
    const { message } = req.body;

    const response: ApiResponse = {
        success: true,
        data: {
            echo: message,
            timestamp: new Date().toISOString()
        },
        message: "Pong received successfully",
        timestamp: new Date().toISOString(),
        requestId: req.headers["x-request-id"] as string
    };

    res.json(response);
});

// Example endpoint with query validation
const searchSchema = z.object({
    ...commonSchemas.pagination.shape,
    q: z.string().min(1, "Search query is required"),
    category: z.enum(["comics", "characters", "artists"]).optional()
});

router.get("/search", validateRequest(searchSchema, "query"), (req: Request, res: Response) => {
    const { q, page, limit, category } = req.query;

    const response: ApiResponse = {
        success: true,
        data: {
            query: q,
            page,
            limit,
            category,
            results: [],
            total: 0,
            hasMore: false
        },
        message: "Search completed successfully",
        timestamp: new Date().toISOString(),
        requestId: req.headers["x-request-id"] as string
    };

    res.json(response);
});

// Example endpoint with params validation
const itemParamsSchema = z.object({
    id: commonSchemas.id
});

router.get("/items/:id", validateRequest(itemParamsSchema, "params"), (req: Request, res: Response) => {
    const { id } = req.params;

    const response: ApiResponse = {
        success: true,
        data: {
            id,
            title: "Sample Item",
            description: "This is a sample item for demonstration",
            createdAt: new Date().toISOString()
        },
        message: "Item retrieved successfully",
        timestamp: new Date().toISOString(),
        requestId: req.headers["x-request-id"] as string
    };

    res.json(response);
});

// Example error endpoint
router.get("/error", (_req: Request, _res: Response, next) => {
    const error = new CustomError("This is a test error endpoint", 500, "TEST_ERROR");
    next(error);
});

export default router;
