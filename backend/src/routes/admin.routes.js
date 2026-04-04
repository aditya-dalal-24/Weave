const router = require('express').Router();
const adminController = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate, authorize('ADMIN'));

router.get('/dashboard', adminController.getDashboard);
router.get('/users', adminController.getUsers);
router.patch('/users/:userId/toggle', adminController.toggleUserStatus);
router.get('/verifications', adminController.getPendingVerifications);
router.patch('/verifications/:verificationId', adminController.reviewVerification);
router.get('/stats', adminController.getPlatformStats);

module.exports = router;
