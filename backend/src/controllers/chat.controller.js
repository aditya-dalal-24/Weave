const chatService = require('../services/chat.service');

class ChatController {
  async getConversations(req, res, next) {
    try {
      const data = await chatService.getConversations(req.user.id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getMessages(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const data = await chatService.getMessages(req.params.conversationId, req.user.id, page);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async sendMessage(req, res, next) {
    try {
      const data = await chatService.sendMessage(req.user.id, req.body.receiverId, req.body.content);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getUnreadCount(req, res, next) {
    try {
      const count = await chatService.getUnreadCount(req.user.id);
      res.json({ success: true, data: { count } });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ChatController();
