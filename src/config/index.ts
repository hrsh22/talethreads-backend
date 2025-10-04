import { config } from "dotenv";
import { z } from "zod";
import { AppConfig } from "@/types";

// Load environment variables
config();

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test", "staging"]).default("development"),
    PORT: z.coerce.number().min(1).max(65535).default(3000),
    HOST: z.string().default("localhost"),
    SERVICE_NAME: z.string().default("talethreads-backend"),
    SERVICE_VERSION: z.string().default("1.0.0"),
    CORS_ORIGIN: z.string().default("http://localhost:3000"),
    RATE_LIMIT_WINDOW_MS: z.coerce.number().positive().default(900000),
    RATE_LIMIT_MAX_REQUESTS: z.coerce.number().positive().default(100),
    LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
    LOG_FORMAT: z.enum(["json", "simple"]).default("json"),
    DATABASE_URL: z.string().default("postgresql://postgres:password@postgres:5433/talethreads"),
    DB_POOL_MIN: z.coerce.number().min(0).default(2),
    DB_POOL_MAX: z.coerce.number().min(1).default(10),
    DB_SSL: z.enum(["true", "false"]).default("false"),

    // Redis configuration
    REDIS_HOST: z.string().default("redis"),
    REDIS_PORT: z.coerce.number().min(1).max(65535).default(6379),
    REDIS_PASSWORD: z.string().optional(),
    REDIS_DB: z.coerce.number().min(0).default(0),
    REDIS_KEY_PREFIX: z.string().default("talethreads:"),
    REDIS_TTL: z.coerce.number().positive().default(3600)
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
    },
    database: {
        url: envVars.DATABASE_URL,
        ssl: envVars.DB_SSL === "true",
        pool: {
            min: envVars.DB_POOL_MIN,
            max: envVars.DB_POOL_MAX
        }
    },
    redis: {
        host: envVars.REDIS_HOST,
        port: envVars.REDIS_PORT,
        password: envVars.REDIS_PASSWORD,
        db: envVars.REDIS_DB,
        keyPrefix: envVars.REDIS_KEY_PREFIX,
        ttl: envVars.REDIS_TTL
    }
};

export default appConfig;
