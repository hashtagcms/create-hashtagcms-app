const express = require('express');
const router = express.Router();
const cacheRoutes = require('./cache');

// Mount routes
router.use('/cache', cacheRoutes);

// Health check for V1 API
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        version: 'v1',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
