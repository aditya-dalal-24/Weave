const adminService = require('../services/admin.service');

class AdminController {
  async getDashboard(req, res, next) {
    try {
      const data = await adminService.getDashboard();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getUsers(req, res, next) {
    try {
      const data = await adminService.getUsers(req.query);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async toggleUserStatus(req, res, next) {
    try {
      const data = await adminService.toggleUserStatus(req.params.userId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getPendingVerifications(req, res, next) {
    try {
      const data = await adminService.getPendingVerifications();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async reviewVerification(req, res, next) {
    try {
      const data = await adminService.reviewVerification(
        req.user.id,
        req.params.verificationId,
        req.body.status,
        req.body.notes
      );
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getPlatformStats(req, res, next) {
    try {
      const data = await adminService.getPlatformStats();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminController();
