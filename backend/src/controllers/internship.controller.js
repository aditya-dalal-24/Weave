const internshipService = require('../services/internship.service');

class InternshipController {
  async create(req, res, next) {
    try {
      const data = await internshipService.create(req.user.id, req.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const data = await internshipService.getAll(req.query);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const data = await internshipService.getById(req.params.id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getMyInternships(req, res, next) {
    try {
      const data = await internshipService.getByRecruiter(req.user.id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const data = await internshipService.update(req.user.id, req.params.id, req.body);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await internshipService.delete(req.user.id, req.params.id);
      res.json({ success: true, message: 'Internship deleted' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new InternshipController();
