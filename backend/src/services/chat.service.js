const prisma = require('../config/database');

class ChatService {
  async getOrCreateConversation(userId1, userId2) {
    // Ensure consistent ordering
    const [p1, p2] = [userId1, userId2].sort();

    let conversation = await prisma.conversation.findUnique({
      where: { participant1Id_participant2Id: { participant1Id: p1, participant2Id: p2 } },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { participant1Id: p1, participant2Id: p2 },
      });
    }

    return conversation;
  }

  async getConversations(userId) {
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ participant1Id: userId }, { participant2Id: userId }],
      },
      include: {
        participant1: {
          select: {
            id: true,
            email: true,
            role: true,
            candidate: { select: { firstName: true, lastName: true, avatar: true } },
            recruiter: { select: { companyName: true, companyLogo: true } },
          },
        },
        participant2: {
          select: {
            id: true,
            email: true,
            role: true,
            candidate: { select: { firstName: true, lastName: true, avatar: true } },
            recruiter: { select: { companyName: true, companyLogo: true } },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { content: true, createdAt: true, senderId: true, isRead: true },
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });

    return conversations.map((conv) => {
      const otherUser = conv.participant1Id === userId ? conv.participant2 : conv.participant1;
      const lastMessage = conv.messages[0] || null;
      return {
        id: conv.id,
        otherUser,
        lastMessage,
        lastMessageAt: conv.lastMessageAt,
      };
    });
  }

  async getMessages(conversationId, userId, page = 1) {
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ participant1Id: userId }, { participant2Id: userId }],
      },
    });

    if (!conversation) {
      const error = new Error('Conversation not found');
      error.statusCode = 404;
      throw error;
    }

    const limit = 50;
    const skip = (page - 1) * limit;

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        sender: {
          select: {
            id: true,
            role: true,
            candidate: { select: { firstName: true, lastName: true } },
            recruiter: { select: { companyName: true } },
          },
        },
      },
    });

    // Mark unread messages as read
    await prisma.message.updateMany({
      where: { conversationId, receiverId: userId, isRead: false },
      data: { isRead: true },
    });

    return messages.reverse();
  }

  async sendMessage(senderId, receiverId, content) {
    const conversation = await this.getOrCreateConversation(senderId, receiverId);

    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId,
        receiverId,
        content,
      },
      include: {
        sender: {
          select: {
            id: true,
            role: true,
            candidate: { select: { firstName: true, lastName: true } },
            recruiter: { select: { companyName: true } },
          },
        },
      },
    });

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date() },
    });

    return { ...message, conversationId: conversation.id };
  }

  async getUnreadCount(userId) {
    return prisma.message.count({
      where: { receiverId: userId, isRead: false },
    });
  }
}

module.exports = new ChatService();
