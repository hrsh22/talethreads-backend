// Import environment type declarations
import "./env";

export interface AppConfig {
    port: number;
    host: string;
    nodeEnv: string;
    serviceName: string;
    serviceVersion: string;
    corsOrigins: string[];
    rateLimit: {
        windowMs: number;
        maxRequests: number;
    };
    logging: {
        level: string;
        format: string;
    };
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    timestamp: string;
    requestId?: string;
}

export interface ErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
        details?: any;
    };
    timestamp: string;
    requestId?: string;
}

export interface HealthCheckResponse {
    status: "healthy" | "unhealthy";
    version: string;
    timestamp: string;
    uptime: number;
    checks: {
        database?: "connected" | "disconnected";
        redis?: "connected" | "disconnected";
        memory: {
            used: number;
            free: number;
            percentage: number;
        };
    };
}
