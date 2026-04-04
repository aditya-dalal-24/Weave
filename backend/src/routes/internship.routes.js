const router = require('express').Router();
const internshipController = require('../controllers/internship.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Public routes
router.get('/', internshipController.getAll);
router.get('/:id', internshipController.getById);

// Recruiter-only routes
router.post('/', authenticate, authorize('RECRUITER'), internshipController.create);
router.get('/my/list', authenticate, authorize('RECRUITER'), internshipController.getMyInternships);
router.put('/:id', authenticate, authorize('RECRUITER'), internshipController.update);
router.delete('/:id', authenticate, authorize('RECRUITER'), internshipController.delete);

module.exports = router;
