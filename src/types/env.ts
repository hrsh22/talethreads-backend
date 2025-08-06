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

            // Future database variables
            DATABASE_URL?: string;
            DB_HOST?: string;
            DB_PORT?: string;
            DB_NAME?: string;
            DB_USER?: string;
            DB_PASSWORD?: string;

            // Future Redis variables
            REDIS_URL?: string;
            REDIS_HOST?: string;
            REDIS_PORT?: string;
            REDIS_PASSWORD?: string;
        }
    }
}

export {}; // Make this file a module
