import { drizzle } from "drizzle-orm/node-postgres";
import config from "@/config";
import logger from "@/utils/logger";
import * as schema from "./schema";

// Initialize Drizzle with connection configuration and schema
export const db = drizzle({
    connection: {
        connectionString: config.database.url,
        ssl: config.database.ssl
    },
    schema
});

// Database connection utilities
export class DatabaseConnection {
    private static instance: DatabaseConnection;
    private isConnected = false;

    private constructor() { }

    public static getInstance(): DatabaseConnection {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection();
        }
        return DatabaseConnection.instance;
    }

    public async connect(): Promise<void> {
        try {
            // Test the connection
            await db.execute('SELECT 1');

            this.isConnected = true;
            logger.info("Database connected successfully", {
                url: config.database.url.replace(/:([^:@]{1,}):/, ':***:'), // Mask password
            });
        } catch (error) {
            this.isConnected = false;
            logger.error("Database connection failed", { error });
            throw error;
        }
    }

    public async disconnect(): Promise<void> {
        try {
            // Note: drizzle-orm/node-postgres handles connection cleanup automatically
            this.isConnected = false;
            logger.info("Database disconnected successfully");
        } catch (error) {
            logger.error("Database disconnection failed", { error });
            throw error;
        }
    }

    public async healthCheck(): Promise<boolean> {
        try {
            await db.execute('SELECT 1');
            return true;
        } catch (error) {
            logger.error("Database health check failed", { error });
            return false;
        }
    }

    public getConnectionStatus(): boolean {
        return this.isConnected;
    }

    public getPoolStats() {
        // Note: drizzle-orm/node-postgres doesn't expose pool stats directly
        // Connection pooling is handled internally
        return {
            status: this.isConnected ? 'connected' : 'disconnected'
        };
    }
}

export const dbConnection = DatabaseConnection.getInstance();
