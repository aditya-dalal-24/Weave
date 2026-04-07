const authService = require('../services/auth.service');

class AuthController {
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const tokens = await authService.refreshToken(refreshToken);
      res.json({ success: true, data: tokens });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      await authService.logout(req.user.id);
      res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }

  async googleLogin(req, res, next) {
    try {
      const { token, role } = req.body;
      const result = await authService.googleLogin(token, role);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async me(req, res, next) {
    try {
      const prisma = require('../config/database');
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
          candidate: { select: { id: true, firstName: true, lastName: true, avatar: true, profileStrength: true } },
          recruiter: { select: { id: true, companyName: true, companyLogo: true, isVerified: true } },
          admin: { select: { id: true, firstName: true, lastName: true } },
        },
      });
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
