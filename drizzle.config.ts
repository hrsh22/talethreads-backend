import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

// Load environment variables
config();

export default defineConfig({
    schema: "./src/db/schema.ts",
    out: "./drizzle/migrations",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5433/talethreads"
    },
    verbose: true,
    strict: true
});
