import { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Send, ArrowLeft } from 'lucide-react';

export default function Chat() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    chatAPI.getConversations().then((r) => setConversations(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeConv) {
      chatAPI.getMessages(activeConv.id).then((r) => setMessages(r.data.data)).catch(() => {});
    }
  }, [activeConv]);

  useEffect(() => {
    if (!socket) return;
    const handler = (msg) => {
      if (activeConv && msg.conversationId === activeConv.id) {
        setMessages((prev) => [...prev, msg]);
      }
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.id === msg.conversationId);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], lastMessage: { content: msg.content, createdAt: msg.createdAt, senderId: msg.senderId }, lastMessageAt: msg.createdAt };
          return updated.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
        }
        return prev;
      });
    };
    socket.on('new_message', handler);
    return () => socket.off('new_message', handler);
  }, [socket, activeConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConv) return;
    try {
      if (socket) { socket.emit('send_message', { receiverId: activeConv.otherUser.id, content: newMessage }); }
      else { await chatAPI.sendMessage({ receiverId: activeConv.otherUser.id, content: newMessage }); }
      setNewMessage('');
    } catch {}
  };

  const getName = (u) => {
    if (u.candidate) return `${u.candidate.firstName} ${u.candidate.lastName}`;
    if (u.recruiter) return u.recruiter.companyName;
    return u.email;
  };

  return (
    <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-700/50 h-[calc(100vh-10rem)] flex overflow-hidden">
      {/* Sidebar */}
      <div className={`w-full sm:w-80 border-r border-slate-200 dark:border-slate-700/50 flex flex-col ${activeConv ? 'hidden sm:flex' : 'flex'}`}>
        <div className="p-4 border-b border-slate-100 dark:border-slate-700/50">
          <h2 className="text-lg font-bold text-navy dark:text-white">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-10 px-4">
              <MessageSquare className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-500 dark:text-slate-400">No conversations yet</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button key={conv.id} onClick={() => setActiveConv(conv)}
                className={`w-full flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left border-b border-slate-50 dark:border-slate-800/30 transition-colors ${activeConv?.id === conv.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {getName(conv.otherUser).charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{getName(conv.otherUser)}</p>
                  {conv.lastMessage && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{conv.lastMessage.content}</p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${activeConv ? 'flex' : 'hidden sm:flex'}`}>
        {activeConv ? (
          <>
            <div className="p-4 border-b border-slate-100 dark:border-slate-700/50 flex items-center gap-3">
              <button onClick={() => setActiveConv(null)} className="sm:hidden p-1"><ArrowLeft className="w-5 h-5 text-slate-500 dark:text-slate-400" /></button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
                {getName(activeConv.otherUser).charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{getName(activeConv.otherUser)}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase">{activeConv.otherUser.role}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F8FAFC] dark:bg-[#0B1120]">
              {messages.map((msg) => {
                const isMe = msg.senderId === user.id || msg.sender?.id === user.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${isMe ? 'bg-primary-600 text-white rounded-br-md' : 'bg-white dark:bg-[#111827] text-slate-800 dark:text-slate-200 rounded-bl-md border border-slate-100 dark:border-slate-700/50'}`}>
                      {msg.content}
                      <p className={`text-[10px] mt-1 ${isMe ? 'text-primary-200' : 'text-slate-400 dark:text-slate-500'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-700/50 bg-white dark:bg-[#111827]">
              <div className="flex items-center gap-2">
                <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] text-navy dark:text-white text-sm outline-none focus:border-primary-400 dark:focus:border-primary-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  placeholder="Type a message..." />
                <button onClick={sendMessage} disabled={!newMessage.trim()}
                  className="p-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors disabled:opacity-40">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0B1120]">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
              <p className="text-sm text-slate-500 dark:text-slate-400">Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
