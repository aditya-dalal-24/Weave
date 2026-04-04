const router = require('express').Router();
const recommendationController = require('../controllers/recommendation.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.get('/', authenticate, authorize('CANDIDATE'), recommendationController.getRecommendations);

module.exports = router;
