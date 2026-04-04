const candidateService = require('../services/candidate.service');

class CandidateController {
  async getDashboard(req, res, next) {
    try {
      const data = await candidateService.getDashboard(req.user.id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const data = await candidateService.getProfile(req.user.id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const data = await candidateService.updateProfile(req.user.id, req.body);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async addEducation(req, res, next) {
    try {
      const data = await candidateService.addEducation(req.user.id, req.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async updateEducation(req, res, next) {
    try {
      const data = await candidateService.updateEducation(req.user.id, req.params.id, req.body);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async deleteEducation(req, res, next) {
    try {
      await candidateService.deleteEducation(req.user.id, req.params.id);
      res.json({ success: true, message: 'Education deleted' });
    } catch (error) {
      next(error);
    }
  }

  async addSkill(req, res, next) {
    try {
      const data = await candidateService.addSkill(req.user.id, req.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async deleteSkill(req, res, next) {
    try {
      await candidateService.deleteSkill(req.user.id, req.params.id);
      res.json({ success: true, message: 'Skill deleted' });
    } catch (error) {
      next(error);
    }
  }

  async updatePreferences(req, res, next) {
    try {
      const data = await candidateService.updatePreferences(req.user.id, req.body);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getProfileSuggestions(req, res, next) {
    try {
      const data = await candidateService.getProfileSuggestions(req.user.id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CandidateController();
