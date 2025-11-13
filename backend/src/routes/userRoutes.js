const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, requireRole } = require('../middleware/auth');
const { validateRating, handleValidationErrors } = require('../middleware/validation');

// All routes require user to be logged in
router.use(verifyToken, requireRole(['normal_user']));

router.get('/stores', userController.listStores);
router.post('/stores/:storeId/rating', validateRating, handleValidationErrors, userController.submitRating);

module.exports = router;
