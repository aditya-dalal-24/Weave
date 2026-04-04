const router = require('express').Router();

router.use('/auth', require('./auth.routes'));
router.use('/candidate', require('./candidate.routes'));
router.use('/recruiter', require('./recruiter.routes'));
router.use('/internships', require('./internship.routes'));
router.use('/applications', require('./application.routes'));
router.use('/recommendations', require('./recommendation.routes'));
router.use('/admin', require('./admin.routes'));
router.use('/chat', require('./chat.routes'));
router.use('/notifications', require('./notification.routes'));

// Health check
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'API is running', timestamp: new Date().toISOString() });
});

module.exports = router;
