import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import config from "@/config";
import logger from "@/utils/logger";
import { readFileSync, readdirSync, writeFileSync } from "fs";
import { join } from "path";

// Types
interface MigrationEntry {
    idx: number;
    version: string;
    when: number;
    tag: string;
    breakpoints: boolean;
}

interface MigrationJournal {
    version: string;
    dialect: string;
    entries: MigrationEntry[];
}

// Database utilities
function createDbConnection() {
    const pool = new Pool({
        connectionString: config.database.url,
        ssl: config.database.ssl ? { rejectUnauthorized: false } : false
    });
    return { pool, db: drizzle(pool) };
}

// File utilities
const MIGRATIONS_DIR = join(process.cwd(), "drizzle/migrations");
const JOURNAL_PATH = join(MIGRATIONS_DIR, "meta/_journal.json");

function readMigrationJournal(): MigrationJournal | null {
    try {
        const content = readFileSync(JOURNAL_PATH, "utf-8");
        return JSON.parse(content);
    } catch {
        return null;
    }
}

function getMigrationFiles(): string[] {
    try {
        return readdirSync(MIGRATIONS_DIR)
            .filter(file => file.endsWith(".sql"))
            .sort();
    } catch {
        return [];
    }
}

function readMigrationFile(filename: string): string | null {
    try {
        return readFileSync(join(MIGRATIONS_DIR, filename), "utf-8");
    } catch {
        return null;
    }
}

function saveMigrationJournal(journal: MigrationJournal): boolean {
    try {
        writeFileSync(JOURNAL_PATH, JSON.stringify(journal, null, 2));
        return true;
    } catch {
        return false;
    }
}

// Migration utilities
function getAppliedMigrations(journal: MigrationJournal | null): Set<string> {
    return new Set(journal?.entries.map(entry => entry.tag) || []);
}

function getPendingMigrations(files: string[], applied: Set<string>): string[] {
    return files.filter(file => !applied.has(file.replace('.sql', '')));
}

async function executeMigration(db: any, filename: string): Promise<boolean> {
    const content = readMigrationFile(filename);
    if (!content) return false;

    const startTime = Date.now();
    logger.info(`📄 Executing: ${filename}`);

    try {
        // Execute the entire migration file as one transaction
        await db.execute(content);
        const duration = Date.now() - startTime;
        logger.info(`✅ Completed: ${filename} (${duration}ms)`);
        return true;
    } catch (error) {
        logger.error(`❌ Failed: ${filename} - ${error instanceof Error ? error.message : String(error)}`);
        return false;
    }
}

async function runMigrations() {
    const { pool, db } = createDbConnection();

    try {
        const journal = readMigrationJournal();
        const files = getMigrationFiles();
        const applied = getAppliedMigrations(journal);
        const pending = getPendingMigrations(files, applied);

        logger.info(`🔍 Found ${files.length} migration files, ${applied.size} applied, ${pending.length} pending`);

        if (pending.length === 0) {
            logger.info("✅ Database is up to date");
            return;
        }

        logger.info(`🚀 Running ${pending.length} migrations: ${pending.join(", ")}`);

        const startTime = Date.now();
        let successCount = 0;

        for (const file of pending) {
            const tag = file.replace('.sql', '');

            if (await executeMigration(db, file)) {
                successCount++;

                // Update journal
                if (journal) {
                    const updatedJournal: MigrationJournal = {
                        ...journal,
                        entries: [...journal.entries, {
                            idx: journal.entries.length,
                            version: journal.version,
                            when: Date.now(),
                            tag,
                            breakpoints: true
                        }]
                    };
                    saveMigrationJournal(updatedJournal);
                }
            } else {
                logger.error(`💥 Migration failed: ${file} - stopping`);
                break;
            }
        }

        const duration = Date.now() - startTime;

        if (successCount === pending.length) {
            logger.info(`✅ Successfully completed ${successCount} migrations in ${duration}ms`);
        } else {
            throw new Error(`Failed after ${successCount}/${pending.length} migrations`);
        }

    } catch (error) {
        logger.error(`❌ Migration error: ${error instanceof Error ? error.message : String(error)}`);
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

async function rollbackMigrations(target?: string, count?: number) {
    const { pool, db } = createDbConnection();

    try {
        const journal = readMigrationJournal();
        if (!journal?.entries || journal.entries.length === 0) {
            logger.info("✅ No migrations to rollback");
            return;
        }

        // Determine which migrations to rollback
        let toRollback: MigrationEntry[];

        if (target) {
            const targetIndex = journal.entries.findIndex(e => e.tag === target);
            if (targetIndex === -1) throw new Error(`Migration not found: ${target}`);
            toRollback = journal.entries.slice(targetIndex + 1);
        } else if (count && count > 0) {
            const startIndex = Math.max(0, journal.entries.length - count);
            toRollback = journal.entries.slice(startIndex);
        } else {
            const last = journal.entries[journal.entries.length - 1];
            if (!last) {
                logger.info("✅ No migrations to rollback");
                return;
            }
            toRollback = [last];
        }

        if (toRollback.length === 0) {
            logger.info("✅ No migrations to rollback");
            return;
        }

        logger.info(`🔄 Rolling back ${toRollback.length} migrations: ${toRollback.map(m => m.tag).join(", ")}`);

        const startTime = Date.now();
        let successCount = 0;

        // Execute rollbacks in reverse order
        for (let i = toRollback.length - 1; i >= 0; i--) {
            const migration = toRollback[i];
            if (!migration) continue;

            const filename = `${migration.tag}.sql`;

            if (await executeMigration(db, filename)) {
                successCount++;

                // Remove from journal
                const updatedJournal: MigrationJournal = {
                    ...journal,
                    entries: journal.entries.filter(e => e.tag !== migration.tag)
                };
                saveMigrationJournal(updatedJournal);
            } else {
                logger.error(`💥 Rollback failed: ${filename} - stopping`);
                break;
            }
        }

        const duration = Date.now() - startTime;

        if (successCount === toRollback.length) {
            logger.info(`✅ Successfully rolled back ${successCount} migrations in ${duration}ms`);
        } else {
            throw new Error(`Rollback failed after ${successCount}/${toRollback.length} migrations`);
        }

    } catch (error) {
        logger.error(`❌ Rollback error: ${error instanceof Error ? error.message : String(error)}`);
        throw error;
    } finally {
        await pool.end();
    }
}

// CLI interface
if (require.main === module) {
    const [command, ...args] = process.argv.slice(2);

    if (command === 'rollback') {
        const target = args[0];
        const count = args[1] ? parseInt(args[1], 10) : undefined;

        rollbackMigrations(target, count)
            .then(() => process.exit(0))
            .catch(() => process.exit(1));
    } else {
        runMigrations()
            .then(() => process.exit(0))
            .catch(() => process.exit(1));
    }
}

export { runMigrations, rollbackMigrations };
