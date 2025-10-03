import { createClient, RedisClientType } from "redis";
import config from "@/config";
import logger from "@/utils/logger";

export class RedisConnection {
    private static instance: RedisConnection;
    private client: RedisClientType | null = null;
    private isConnected = false;

    private constructor() { }

    public static getInstance(): RedisConnection {
        if (!RedisConnection.instance) {
            RedisConnection.instance = new RedisConnection();
        }
        return RedisConnection.instance;
    }

    public async connect(): Promise<void> {
        try {
            if (this.isConnected && this.client) {
                logger.info("Redis already connected");
                return;
            }

            this.client = createClient({
                socket: {
                    host: config.redis.host,
                    port: config.redis.port
                },
                ...(config.redis.password && { password: config.redis.password }),
                database: config.redis.db
            });

            this.client.on("error", (error) => {
                logger.error("Redis client error", { error: error.message });
                this.isConnected = false;
            });

            this.client.on("connect", () => {
                logger.info("Redis client connecting...");
            });

            this.client.on("ready", () => {
                logger.info("Redis client ready");
                this.isConnected = true;
            });

            this.client.on("end", () => {
                logger.info("Redis client connection ended");
                this.isConnected = false;
            });

            await this.client.connect();

            logger.info("Redis connected successfully", {
                host: config.redis.host,
                port: config.redis.port,
                db: config.redis.db,
                keyPrefix: config.redis.keyPrefix
            });
        } catch (error) {
            this.isConnected = false;
            logger.error("Redis connection failed", { error });
            throw error;
        }
    }

    public async disconnect(): Promise<void> {
        try {
            if (this.client) {
                await this.client.quit();
                this.client = null;
            }
            this.isConnected = false;
            logger.info("Redis disconnected successfully");
        } catch (error) {
            logger.error("Redis disconnection failed", { error });
            throw error;
        }
    }

    public async healthCheck(): Promise<boolean> {
        try {
            if (!this.client || !this.isConnected) {
                return false;
            }

            // Simple ping command to test connection
            await this.client.ping();
            return true;
        } catch (error) {
            logger.error("Redis health check failed", { error });
            return false;
        }
    }

    public getConnectionStatus(): boolean {
        return this.isConnected;
    }

    public getClient(): RedisClientType | null {
        return this.client;
    }

    public getStats() {
        if (!this.client) {
            return { status: "disconnected" };
        }

        return {
            status: this.isConnected ? "connected" : "disconnected",
            host: config.redis.host,
            port: config.redis.port,
            db: config.redis.db,
            keyPrefix: config.redis.keyPrefix
        };
    }
}

export const redisConnection = RedisConnection.getInstance();

// Helper functions for common Redis operations
export class RedisService {
    private static instance: RedisService;
    private client: RedisClientType | null = null;

    private constructor() { }

    public static getInstance(): RedisService {
        if (!RedisService.instance) {
            RedisService.instance = new RedisService();
        }
        return RedisService.instance;
    }

    private async getClient(): Promise<RedisClientType> {
        if (!this.client) {
            this.client = redisConnection.getClient();
        }
        if (!this.client) {
            throw new Error("Redis client not available");
        }
        return this.client;
    }

    // Helper method to add key prefix
    private addKeyPrefix(key: string): string {
        return `${config.redis.keyPrefix}${key}`;
    }

    // Cache operations
    public async set(key: string, value: string, ttl?: number): Promise<void> {
        const client = await this.getClient();
        const finalTtl = ttl || config.redis.ttl;
        const prefixedKey = this.addKeyPrefix(key);
        await client.setEx(prefixedKey, finalTtl, value);
    }

    public async get(key: string): Promise<string | null> {
        const client = await this.getClient();
        const prefixedKey = this.addKeyPrefix(key);
        return await client.get(prefixedKey);
    }

    public async del(key: string): Promise<number> {
        const client = await this.getClient();
        const prefixedKey = this.addKeyPrefix(key);
        return await client.del(prefixedKey);
    }

    public async exists(key: string): Promise<boolean> {
        const client = await this.getClient();
        const prefixedKey = this.addKeyPrefix(key);
        const result = await client.exists(prefixedKey);
        return result > 0;
    }

    // JSON operations
    public async setJson(key: string, value: any, ttl?: number): Promise<void> {
        await this.set(key, JSON.stringify(value), ttl);
    }

    public async getJson<T = any>(key: string): Promise<T | null> {
        const value = await this.get(key);
        if (!value) return null;

        try {
            return JSON.parse(value) as T;
        } catch {
            return null;
        }
    }

    // Hash operations
    public async hSet(key: string, field: string, value: string): Promise<number> {
        const client = await this.getClient();
        const prefixedKey = this.addKeyPrefix(key);
        return await client.hSet(prefixedKey, field, value);
    }

    public async hGet(key: string, field: string): Promise<string | null> {
        const client = await this.getClient();
        const prefixedKey = this.addKeyPrefix(key);
        return await client.hGet(prefixedKey, field);
    }

    public async hGetAll(key: string): Promise<Record<string, string>> {
        const client = await this.getClient();
        const prefixedKey = this.addKeyPrefix(key);
        return await client.hGetAll(prefixedKey);
    }

    public async hDel(key: string, field: string): Promise<number> {
        const client = await this.getClient();
        const prefixedKey = this.addKeyPrefix(key);
        return await client.hDel(prefixedKey, field);
    }

    // Set operations
    public async sAdd(key: string, member: string): Promise<number> {
        const client = await this.getClient();
        const prefixedKey = this.addKeyPrefix(key);
        return await client.sAdd(prefixedKey, member);
    }

    public async sMembers(key: string): Promise<string[]> {
        const client = await this.getClient();
        const prefixedKey = this.addKeyPrefix(key);
        return await client.sMembers(prefixedKey);
    }

    public async sIsMember(key: string, member: string): Promise<boolean> {
        const client = await this.getClient();
        const prefixedKey = this.addKeyPrefix(key);
        const result = await client.sIsMember(prefixedKey, member);
        return result === 1;
    }

    public async sRem(key: string, member: string): Promise<number> {
        const client = await this.getClient();
        const prefixedKey = this.addKeyPrefix(key);
        return await client.sRem(prefixedKey, member);
    }

    // List operations
    public async lPush(key: string, element: string): Promise<number> {
        const client = await this.getClient();
        const prefixedKey = this.addKeyPrefix(key);
        return await client.lPush(prefixedKey, element);
    }

    public async rPush(key: string, element: string): Promise<number> {
        const client = await this.getClient();
        const prefixedKey = this.addKeyPrefix(key);
        return await client.rPush(prefixedKey, element);
    }

    public async lRange(key: string, start: number, stop: number): Promise<string[]> {
        const client = await this.getClient();
        const prefixedKey = this.addKeyPrefix(key);
        return await client.lRange(prefixedKey, start, stop);
    }

    public async lLen(key: string): Promise<number> {
        const client = await this.getClient();
        const prefixedKey = this.addKeyPrefix(key);
        return await client.lLen(prefixedKey);
    }

    // Key operations
    public async keys(pattern: string): Promise<string[]> {
        const client = await this.getClient();
        const prefixedPattern = this.addKeyPrefix(pattern);
        return await client.keys(prefixedPattern);
    }

    public async ttl(key: string): Promise<number> {
        const client = await this.getClient();
        const prefixedKey = this.addKeyPrefix(key);
        return await client.ttl(prefixedKey);
    }

    public async expire(key: string, seconds: number): Promise<boolean> {
        const client = await this.getClient();
        const prefixedKey = this.addKeyPrefix(key);
        const result = await client.expire(prefixedKey, seconds);
        return result === 1;
    }

    public async flushAll(): Promise<string> {
        const client = await this.getClient();
        return await client.flushAll();
    }
}

export const redisService = RedisService.getInstance();
