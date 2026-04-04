const router = require('express').Router();
const candidateController = require('../controllers/candidate.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate, authorize('CANDIDATE'));

router.get('/dashboard', candidateController.getDashboard);
router.get('/profile', candidateController.getProfile);
router.put('/profile', candidateController.updateProfile);
router.post('/education', candidateController.addEducation);
router.put('/education/:id', candidateController.updateEducation);
router.delete('/education/:id', candidateController.deleteEducation);
router.post('/skills', candidateController.addSkill);
router.delete('/skills/:id', candidateController.deleteSkill);
router.put('/preferences', candidateController.updatePreferences);
router.get('/suggestions', candidateController.getProfileSuggestions);

module.exports = router;
