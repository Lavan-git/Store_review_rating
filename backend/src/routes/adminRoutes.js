const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, requireRole } = require('../middleware/auth');
const { validateAddUser, validateAddStore, handleValidationErrors } = require('../middleware/validation');

// All routes require admin role
router.use(verifyToken, requireRole(['admin']));

router.get('/dashboard', adminController.getDashboard);
router.post('/users', validateAddUser, handleValidationErrors, adminController.addUser);
router.post('/stores', validateAddStore, handleValidationErrors, adminController.addStore);
router.get('/users', adminController.listUsers);
router.get('/stores', adminController.listStores);
router.get('/stores/:storeId', adminController.getStoreDetails);
router.get('/users/:userId', adminController.getUserDetails);
router.put('/users/:userId', validateAddUser, handleValidationErrors, adminController.updateUser);
router.delete('/users/:userId', adminController.deleteUser);
router.put('/stores/:storeId', validateAddStore, handleValidationErrors, adminController.updateStore);
router.delete('/stores/:storeId', adminController.deleteStore);

module.exports = router;
