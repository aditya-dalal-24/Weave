const notificationService = require('../services/notification.service');

class NotificationController {
  async getNotifications(req, res, next) {
    try {
      const unreadOnly = req.query.unread === 'true';
      const data = await notificationService.getNotifications(req.user.id, unreadOnly);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const data = await notificationService.markAsRead(req.params.id, req.user.id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req, res, next) {
    try {
      await notificationService.markAllAsRead(req.user.id);
      res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
      next(error);
    }
  }

  async getUnreadCount(req, res, next) {
    try {
      const count = await notificationService.getUnreadCount(req.user.id);
      res.json({ success: true, data: { count } });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NotificationController();
