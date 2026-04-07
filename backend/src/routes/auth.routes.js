const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { authLimiter } = require('../middleware/rateLimiter.middleware');
const Joi = require('joi');

const registerSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('CANDIDATE', 'RECRUITER').required(),
    firstName: Joi.string().when('role', { is: 'CANDIDATE', then: Joi.required(), otherwise: Joi.optional().allow('') }),
    lastName: Joi.string().when('role', { is: 'CANDIDATE', then: Joi.required(), otherwise: Joi.optional().allow('') }),
    companyName: Joi.string().when('role', { is: 'RECRUITER', then: Joi.required(), otherwise: Joi.optional().allow('') }),
    confirmPassword: Joi.any().strip(),
  }),
};

const loginSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};

const googleLoginSchema = {
  body: Joi.object({
    token: Joi.string().required(),
    role: Joi.string().valid('CANDIDATE', 'RECRUITER').optional(),
  }),
};

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/google', authLimiter, validate(googleLoginSchema), authController.googleLogin);
router.post('/refresh', authController.refresh);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.me);

module.exports = router;
