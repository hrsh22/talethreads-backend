import { config } from "dotenv";
import { z } from "zod";
import { AppConfig } from "@/types";

// Load environment variables
config();

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test", "staging"]).default("development"),
    PORT: z.coerce.number().min(1).max(65535).default(3000),
    HOST: z.string().default("localhost"),
    SERVICE_NAME: z.string().default("comics-ai-backend"),
    SERVICE_VERSION: z.string().default("1.0.0"),
    CORS_ORIGIN: z.string().default("http://localhost:3000"),
    RATE_LIMIT_WINDOW_MS: z.coerce.number().positive().default(900000),
    RATE_LIMIT_MAX_REQUESTS: z.coerce.number().positive().default(100),
    LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
    LOG_FORMAT: z.enum(["json", "simple"]).default("json")
});

const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
    const errorMessages = parseResult.error.errors.map(err => `${err.path.join(".")}: ${err.message}`).join(", ");
    throw new Error(`Config validation error: ${errorMessages}`);
}

const envVars = parseResult.data;

const appConfig: AppConfig = {
    port: envVars.PORT,
    host: envVars.HOST,
    nodeEnv: envVars.NODE_ENV,
    serviceName: envVars.SERVICE_NAME,
    serviceVersion: envVars.SERVICE_VERSION,
    corsOrigins: envVars.CORS_ORIGIN.split(",").map((origin: string) => origin.trim()),
    rateLimit: {
        windowMs: envVars.RATE_LIMIT_WINDOW_MS,
        maxRequests: envVars.RATE_LIMIT_MAX_REQUESTS
    },
    logging: {
        level: envVars.LOG_LEVEL,
        format: envVars.LOG_FORMAT
    }
};

export default appConfig;
