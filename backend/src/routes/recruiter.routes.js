const router = require('express').Router();
const recruiterController = require('../controllers/recruiter.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate, authorize('RECRUITER'));

router.get('/dashboard', recruiterController.getDashboard);
router.get('/profile', recruiterController.getProfile);
router.put('/profile', recruiterController.updateProfile);
router.get('/applicants', recruiterController.getApplicants);
router.patch('/applications/:applicationId/shortlist', recruiterController.shortlistCandidate);
router.patch('/applications/:applicationId/status', recruiterController.updateApplicationStatus);

module.exports = router;
