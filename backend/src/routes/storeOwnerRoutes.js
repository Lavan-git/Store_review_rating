const express = require('express');
const router = express.Router();
const storeOwnerController = require('../controllers/storeOwnerController');
const { verifyToken, requireRole } = require('../middleware/auth');

// All routes require store owner role
router.use(verifyToken, requireRole(['store_owner']));

router.get('/dashboard', storeOwnerController.getDashboard);

module.exports = router;
