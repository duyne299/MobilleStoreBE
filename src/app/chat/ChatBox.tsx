'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface ChatBoxProps {
  userId: number;
  adminId: number;
  role: 'user' | 'admin';
}

interface Message {
  senderId: number;
  receiverId: number;
  content: string;
  createdAt?: string;
}

export default function ChatBox({ userId, adminId, role }: ChatBoxProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [conversationId, setConversationId] = useState<number | null>(null);

  // 1️⃣ Kết nối socket khi vào trang
  useEffect(() => {
    const s = io('http://localhost:8080', {
      query: { userId },
      transports: ['websocket'],
    });
    setSocket(s);

    s.on('connect', () => {
      console.log(`${role} connected to websocket`);
    });

    s.on('receive_message', (data: Message) => {
      setMessages((prev) => [...prev, data]);
    });

    s.on('message_sent', (data: Message) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      s.disconnect();
    };
  }, [userId, role]);

  // 2️⃣ Gửi tin nhắn
  const handleSend = () => {
    if (!socket || !message.trim()) return;
    const msg: Message = {
      senderId: userId,
      receiverId: adminId,
      content: message,
    };
    socket.emit('send_message', msg);
    setMessage('');
  };

  return (
    <div className="flex flex-col w-[400px] h-[500px] border rounded-lg shadow-lg p-4">
      <div className="flex-1 overflow-y-auto space-y-2 mb-4 bg-gray-50 p-2 rounded-md">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-2 rounded-lg max-w-[70%] ${
              msg.senderId === userId
                ? 'bg-blue-500 text-white ml-auto'
                : 'bg-gray-300 text-black mr-auto'
            }`}
          >
            {msg.content}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 border p-2 rounded-md outline-none"
          placeholder="Nhập tin nhắn..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          Gửi
        </button>
      </div>
    </div>
  );
}
