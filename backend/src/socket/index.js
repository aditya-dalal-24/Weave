const jwt = require('jsonwebtoken');
const chatService = require('../services/chat.service');

function initializeSocket(io) {
  // Auth middleware for socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      socket.userRole = decoded.role;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Join user's personal room for notifications
    socket.join(`user:${socket.userId}`);

    // Send message
    socket.on('send_message', async (data) => {
      try {
        const message = await chatService.sendMessage(socket.userId, data.receiverId, data.content);

        // Emit to both sender and receiver
        io.to(`user:${socket.userId}`).emit('new_message', message);
        io.to(`user:${data.receiverId}`).emit('new_message', message);
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Typing indicator
    socket.on('typing', (data) => {
      io.to(`user:${data.receiverId}`).emit('user_typing', {
        userId: socket.userId,
        conversationId: data.conversationId,
      });
    });

    socket.on('stop_typing', (data) => {
      io.to(`user:${data.receiverId}`).emit('user_stop_typing', {
        userId: socket.userId,
        conversationId: data.conversationId,
      });
    });

    // Mark messages as read
    socket.on('mark_read', async (data) => {
      try {
        await chatService.getMessages(data.conversationId, socket.userId);
        io.to(`user:${data.senderId}`).emit('messages_read', {
          conversationId: data.conversationId,
          readBy: socket.userId,
        });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });

  return io;
}

// Helper to emit notifications to a specific user
function emitNotification(io, userId, notification) {
  io.to(`user:${userId}`).emit('notification', notification);
}

module.exports = { initializeSocket, emitNotification };
