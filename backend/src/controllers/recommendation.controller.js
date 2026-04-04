const recommendationService = require('../services/recommendation.service');

class RecommendationController {
  async getRecommendations(req, res, next) {
    try {
      const data = await recommendationService.getRecommendations(req.user.id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RecommendationController();
