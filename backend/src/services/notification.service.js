const prisma = require('../config/database');

class NotificationService {
  async getNotifications(userId, unreadOnly = false) {
    const where = { userId };
    if (unreadOnly) where.isRead = false;

    return prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markAsRead(notificationId, userId) {
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      const error = new Error('Notification not found');
      error.statusCode = 404;
      throw error;
    }

    return prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId) {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async getUnreadCount(userId) {
    return prisma.notification.count({ where: { userId, isRead: false } });
  }

  async create(userId, title, message, type = 'info') {
    return prisma.notification.create({
      data: { userId, title, message, type },
    });
  }
}

module.exports = new NotificationService();
