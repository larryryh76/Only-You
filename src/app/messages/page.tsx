'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import { Send } from 'lucide-react';

function MessagesContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetUserId = searchParams.get('userId');

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && targetUserId) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000); // Poll for new messages
      return () => clearInterval(interval);
    }
  }, [status, targetUserId]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/messages?userId=${targetUserId}`);
      const data = await res.json();
      setMessages(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receiverId: targetUserId, content: newMessage }),
    });

    if (res.ok) {
      setNewMessage('');
      fetchMessages();
    }
  };

  if (status === 'loading' || (targetUserId && loading)) return <div className="text-center py-20">Loading...</div>;

  return (
    <main className="flex-1 max-w-4xl w-full mx-auto p-6 flex flex-col overflow-hidden">
      {!targetUserId ? (
        <div className="flex-1 flex items-center justify-center text-gray-500 italic">
          Select a creator from their profile to start messaging.
        </div>
      ) : (
        <>
          <div className="flex-1 bg-white rounded-t-2xl shadow-sm border border-gray-100 p-6 overflow-y-auto space-y-4">
            {messages.map((msg: any) => (
              <div
                key={msg._id}
                className={`flex ${msg.senderId === (session?.user as any).id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] p-4 rounded-2xl ${
                    msg.senderId === (session?.user as any).id
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-gray-100 text-gray-800 rounded-tl-none'
                  }`}
                >
                  <p>{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${msg.senderId === (session?.user as any).id ? 'text-blue-100' : 'text-gray-400'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {messages.length === 0 && (
              <p className="text-center text-gray-400 italic py-10">No messages yet. Say hi!</p>
            )}
          </div>
          <form onSubmit={handleSendMessage} className="bg-white border-t border-gray-100 p-4 rounded-b-2xl shadow-sm flex gap-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 border border-gray-200 rounded-full px-6 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition"
            >
              <Send size={20} />
            </button>
          </form>
        </>
      )}
    </main>
  );
}

export default function Messages() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <Suspense fallback={<div className="text-center py-20">Loading messages...</div>}>
        <MessagesContent />
      </Suspense>
    </div>
  );
}
