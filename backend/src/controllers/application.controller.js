const applicationService = require('../services/application.service');

class ApplicationController {
  async apply(req, res, next) {
    try {
      const data = await applicationService.apply(req.user.id, req.body.internshipId, req.body.coverLetter);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getMyApplications(req, res, next) {
    try {
      const data = await applicationService.getCandidateApplications(req.user.id, req.query.status);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const data = await applicationService.getById(req.params.id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async withdraw(req, res, next) {
    try {
      await applicationService.withdraw(req.user.id, req.params.id);
      res.json({ success: true, message: 'Application withdrawn' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ApplicationController();
