import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import config from "@/config";
import logger from "@/utils/logger";

async function runMigrations() {
    const pool = new Pool({
        connectionString: config.database.url,
        ssl: config.database.ssl ? { rejectUnauthorized: false } : false
    });

    const db = drizzle(pool);

    try {
        logger.info("Starting database migrations...");

        await migrate(db, {
            migrationsFolder: "./drizzle/migrations"
        });

        logger.info("Database migrations completed successfully");
    } catch (error) {
        logger.error("Migration failed", { error });
        throw error;
    } finally {
        await pool.end();
    }
}

// Run migrations if this file is executed directly
if (require.main === module) {
    runMigrations()
        .then(() => {
            process.exit(0);
        })
        .catch((error) => {
            logger.error("❌ Migration failed:", error);
            process.exit(1);
        });
}

export { runMigrations };
