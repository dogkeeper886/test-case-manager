const express = require('express');
const MigrationService = require('../services/MigrationService');
const router = express.Router();

// Get migration status
router.get('/status', async (req, res) => {
    try {
        const migrationService = new MigrationService(req.app.locals.db);
        const status = await migrationService.checkMigrationStatus();
        res.json(status);
    } catch (error) {
        console.error('Error checking migration status:', error);
        res.status(500).json({ error: 'Failed to check migration status' });
    }
});

// Run migrations manually
router.post('/run', async (req, res) => {
    try {
        const migrationService = new MigrationService(req.app.locals.db);
        const result = await migrationService.runMigrations();
        res.json({
            message: 'Migrations completed',
            result
        });
    } catch (error) {
        console.error('Error running migrations:', error);
        res.status(500).json({ error: 'Failed to run migrations' });
    }
});

module.exports = router; 