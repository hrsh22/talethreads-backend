import { db } from "./connection";
import { users } from "./schema";
import logger from "@/utils/logger";

async function seedDatabase() {
    try {
        logger.info("Starting database seeding...");

        // Example seed data - You can modify this later when implementing auth
        const seedUsers = [
            {
                email: "admin@comics-ai.com",
                username: "admin",
                passwordHash: "temp_hash", // This will be replaced when auth is implemented
                firstName: "Admin",
                lastName: "User",
                isActive: true,
                isVerified: true
            }
        ];

        for (const user of seedUsers) {
            await db.insert(users).values(user).onConflictDoNothing();
        }

        logger.info("Database seeding completed successfully");
    } catch (error) {
        logger.error("Database seeding failed", { error });
        throw error;
    }
}

// Run seeding if this file is executed directly
if (require.main === module) {
    seedDatabase()
        .then(() => {
            console.log("✅ Database seeded successfully");
            process.exit(0);
        })
        .catch((error) => {
            console.error("❌ Database seeding failed:", error);
            process.exit(1);
        });
}

export { seedDatabase };
