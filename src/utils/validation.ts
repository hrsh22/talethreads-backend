import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import { CustomError } from "@/middleware/error";

// Common validation schemas
export const commonSchemas = {
    id: z.string().uuid("Invalid ID format"),
    pagination: z.object({
        page: z.coerce.number().min(1).default(1),
        limit: z.coerce.number().min(1).max(100).default(10)
    }),
    sort: z.object({
        sortBy: z.string().optional(),
        sortOrder: z.enum(["asc", "desc"]).default("asc")
    })
};

// Validation middleware factory
export function validateRequest<T extends z.ZodSchema>(schema: T, source: "body" | "query" | "params" = "body") {
    return (req: Request, _res: Response, next: NextFunction): void => {
        try {
            const dataToValidate = req[source];
            const result = schema.safeParse(dataToValidate);

            if (!result.success) {
                const errorMessages = result.error.errors.map(err => `${err.path.join(".")}: ${err.message}`);

                throw new CustomError(`Validation failed: ${errorMessages.join(", ")}`, 400, "VALIDATION_ERROR");
            }

            // Replace the original data with the parsed and validated data
            req[source] = result.data;
            next();
        } catch (error) {
            next(error);
        }
    };
}

// Utility function for validating data outside of middleware
export function validateData<T extends z.ZodSchema>(schema: T, data: unknown): z.infer<T> {
    const result = schema.safeParse(data);

    if (!result.success) {
        const errorMessages = result.error.errors.map(err => `${err.path.join(".")}: ${err.message}`);

        throw new CustomError(`Validation failed: ${errorMessages.join(", ")}`, 400, "VALIDATION_ERROR");
    }

    return result.data;
}
