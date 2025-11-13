const express = require('express');
const router = express.Router();
const storeOwnerController = require('../controllers/storeOwnerController');
const { verifyToken, requireRole } = require('../middleware/auth');
const { validateOwnerCreateStore, validateOwnerUpdateStore, handleValidationErrors } = require('../middleware/validation');

// All routes require store owner role
router.use(verifyToken, requireRole(['store_owner']));

router.get('/dashboard', storeOwnerController.getDashboard);
router.post('/stores', validateOwnerCreateStore, handleValidationErrors, storeOwnerController.createStore);
router.put('/stores/:storeId', validateOwnerUpdateStore, handleValidationErrors, storeOwnerController.updateStore);

module.exports = router;
