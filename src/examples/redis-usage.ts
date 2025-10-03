/**
 * Example usage of Redis functionality
 * This file demonstrates how to use the Redis service in your application
 */

import { redisService, redisConnection } from "@/db";

async function exampleRedisUsage() {
    try {
        // Ensure Redis is connected
        await redisConnection.connect();

        console.log("🚀 Redis connection established");

        // Basic cache operations
        await redisService.set("test:key", "Hello Redis!");
        const value = await redisService.get("test:key");
        console.log("✅ Cached value:", value);

        // JSON operations
        const userData = {
            id: 1,
            name: "John Doe",
            email: "john@example.com"
        };
        await redisService.setJson("user:1", userData);
        const retrievedUser = await redisService.getJson("user:1");
        console.log("✅ JSON data:", retrievedUser);

        // Hash operations
        await redisService.hSet("user:1:profile", "firstName", "John");
        await redisService.hSet("user:1:profile", "lastName", "Doe");
        const firstName = await redisService.hGet("user:1:profile", "firstName");
        const profile = await redisService.hGetAll("user:1:profile");
        console.log("✅ Hash data:", { firstName, profile });

        // Set operations
        await redisService.sAdd("tags", "typescript");
        await redisService.sAdd("tags", "nodejs");
        await redisService.sAdd("tags", "redis");
        const tags = await redisService.sMembers("tags");
        const isMember = await redisService.sIsMember("tags", "nodejs");
        console.log("✅ Set data:", { tags, isMember });

        // List operations
        await redisService.lPush("queue:messages", "Message 1");
        await redisService.lPush("queue:messages", "Message 2");
        await redisService.rPush("queue:messages", "Message 3");
        const queueLength = await redisService.lLen("queue:messages");
        const messages = await redisService.lRange("queue:messages", 0, -1);
        console.log("✅ List data:", { queueLength, messages });

        // Check if key exists
        const exists = await redisService.exists("test:key");
        console.log("✅ Key exists:", exists);

        // Set TTL and check expiration
        await redisService.expire("temp:key", 60); // Expires in 60 seconds
        const ttl = await redisService.ttl("temp:key");
        console.log("✅ TTL:", ttl);

        // Clean up
        await redisService.del("test:key");
        await redisService.del("user:1");
        await redisService.del("user:1:profile");
        await redisService.del("tags");
        await redisService.del("queue:messages");
        await redisService.del("temp:key");

        console.log("✅ All keys cleaned up");

        // Disconnect
        await redisConnection.disconnect();
        console.log("🔌 Redis connection closed");

    } catch (error) {
        console.error("❌ Redis example failed:", error);
    }
}

// Run the example if this file is executed directly
if (require.main === module) {
    exampleRedisUsage()
        .then(() => {
            console.log("🎉 Redis example completed successfully");
            process.exit(0);
        })
        .catch((error) => {
            console.error("💥 Redis example failed:", error);
            process.exit(1);
        });
}

export { exampleRedisUsage };
