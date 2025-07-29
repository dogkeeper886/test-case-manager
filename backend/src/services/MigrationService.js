const fs = require('fs').promises;
const path = require('path');

class MigrationService {
    constructor(db) {
        this.db = db;
        this.migrationsPath = path.join(__dirname, '../../database/migrations');
    }

    async createMigrationsTable() {
        const query = `
            CREATE TABLE IF NOT EXISTS migrations (
                id SERIAL PRIMARY KEY,
                migration_name VARCHAR(255) UNIQUE NOT NULL,
                applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await this.db.query(query);
    }

    async getAppliedMigrations() {
        const query = 'SELECT migration_name FROM migrations ORDER BY applied_at';
        const result = await this.db.query(query);
        return result.rows.map(row => row.migration_name);
    }

    async getMigrationFiles() {
        try {
            const files = await fs.readdir(this.migrationsPath);
            return files
                .filter(file => file.endsWith('.sql'))
                .sort(); // Sort alphabetically to ensure order
        } catch (error) {
            console.warn('Migrations directory not found:', this.migrationsPath);
            return [];
        }
    }

    async applyMigration(migrationName, migrationContent) {
        try {
            console.log(`Applying migration: ${migrationName}`);
            
            // Apply the migration
            await this.db.query(migrationContent);
            
            // Record the migration as applied
            const insertQuery = 'INSERT INTO migrations (migration_name) VALUES ($1)';
            await this.db.query(insertQuery, [migrationName]);
            
            console.log(`✅ Migration applied successfully: ${migrationName}`);
            return true;
        } catch (error) {
            console.error(`❌ Failed to apply migration ${migrationName}:`, error.message);
            return false;
        }
    }

    async runMigrations() {
        try {
            console.log('🔄 Starting database migrations...');
            
            // Create migrations table if it doesn't exist
            await this.createMigrationsTable();
            
            // Get already applied migrations
            const appliedMigrations = await this.getAppliedMigrations();
            console.log('Applied migrations:', appliedMigrations);
            
            // Get migration files
            const migrationFiles = await this.getMigrationFiles();
            console.log('Available migration files:', migrationFiles);
            
            let appliedCount = 0;
            let failedCount = 0;
            
            for (const migrationFile of migrationFiles) {
                const migrationName = migrationFile.replace('.sql', '');
                
                // Skip if already applied
                if (appliedMigrations.includes(migrationName)) {
                    console.log(`⏭️  Skipping already applied migration: ${migrationName}`);
                    continue;
                }
                
                // Read and apply migration
                const migrationPath = path.join(this.migrationsPath, migrationFile);
                const migrationContent = await fs.readFile(migrationPath, 'utf8');
                
                const success = await this.applyMigration(migrationName, migrationContent);
                if (success) {
                    appliedCount++;
                } else {
                    failedCount++;
                }
            }
            
            console.log(`🎉 Migration summary: ${appliedCount} applied, ${failedCount} failed`);
            
            if (failedCount > 0) {
                throw new Error(`${failedCount} migrations failed to apply`);
            }
            
            return { applied: appliedCount, failed: failedCount };
        } catch (error) {
            console.error('❌ Migration process failed:', error);
            throw error;
        }
    }

    async checkMigrationStatus() {
        try {
            const appliedMigrations = await this.getAppliedMigrations();
            const migrationFiles = await this.getMigrationFiles();
            
            const pendingMigrations = migrationFiles.filter(file => {
                const migrationName = file.replace('.sql', '');
                return !appliedMigrations.includes(migrationName);
            });
            
            return {
                applied: appliedMigrations,
                pending: pendingMigrations,
                total: migrationFiles.length,
                appliedCount: appliedMigrations.length,
                pendingCount: pendingMigrations.length
            };
        } catch (error) {
            console.error('Error checking migration status:', error);
            throw error;
        }
    }
}

module.exports = MigrationService; 