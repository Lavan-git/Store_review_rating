const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateSignup, validatePasswordChange, handleValidationErrors } = require('../middleware/validation');
const { verifyToken } = require('../middleware/auth');

// Public routes
router.post('/signup', validateSignup, handleValidationErrors, authController.signup);
router.post('/login', authController.login);

// Protected routes
router.post('/change-password', verifyToken, validatePasswordChange, handleValidationErrors, authController.changePassword);

// Password reset
router.post('/reset-password-request', authController.requestPasswordReset);
router.post('/reset-password', authController.performPasswordReset);

module.exports = router;
