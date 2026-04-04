const router = require('express').Router();
const applicationController = require('../controllers/application.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate, authorize('CANDIDATE'));

router.post('/', applicationController.apply);
router.get('/', applicationController.getMyApplications);
router.get('/:id', applicationController.getById);
router.delete('/:id', applicationController.withdraw);

module.exports = router;
