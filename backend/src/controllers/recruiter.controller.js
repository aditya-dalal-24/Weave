const recruiterService = require('../services/recruiter.service');

class RecruiterController {
  async getDashboard(req, res, next) {
    try {
      const data = await recruiterService.getDashboard(req.user.id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const data = await recruiterService.getProfile(req.user.id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const data = await recruiterService.updateProfile(req.user.id, req.body);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getApplicants(req, res, next) {
    try {
      const data = await recruiterService.getApplicants(req.user.id, req.query.internshipId, {
        status: req.query.status,
        skills: req.query.skills ? req.query.skills.split(',') : null,
      });
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async shortlistCandidate(req, res, next) {
    try {
      const data = await recruiterService.shortlistCandidate(req.user.id, req.params.applicationId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async updateApplicationStatus(req, res, next) {
    try {
      const data = await recruiterService.updateApplicationStatus(
        req.user.id,
        req.params.applicationId,
        req.body.status
      );
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RecruiterController();
