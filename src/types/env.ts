// Extend the NodeJS global namespace to add typed environment variables
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: "development" | "production" | "test" | "staging";
            PORT: string;
            HOST: string;
            SERVICE_NAME: string;
            SERVICE_VERSION: string;
            CORS_ORIGIN: string;
            RATE_LIMIT_WINDOW_MS: string;
            RATE_LIMIT_MAX_REQUESTS: string;
            LOG_LEVEL: "error" | "warn" | "info" | "debug";
            LOG_FORMAT: "json" | "simple";

            // Database configuration
            DATABASE_URL: string;
            DB_POOL_MIN: string;
            DB_POOL_MAX: string;
            DB_SSL: "true" | "false";

            // Redis configuration
            REDIS_HOST: string;
            REDIS_PORT: string;
            REDIS_PASSWORD?: string;
            REDIS_DB: string;
            REDIS_KEY_PREFIX: string;
            REDIS_TTL: string;
        }
    }
}

export { }; // Make this file a module
