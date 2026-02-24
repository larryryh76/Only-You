'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense, useCallback } from 'react';
import { Send, MessageSquare, User, CreditCard } from 'lucide-react';
import Image from 'next/image';

interface IMessage {
  _id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
}

interface IPaymentDetails {
  cashapp?: string;
  crypto?: string;
}

interface IConversation {
  user?: {
    _id: string;
    name: string;
    username: string;
    profileImage?: string;
    role: string;
  };
  users?: Array<{
    _id: string;
    name: string;
    username: string;
    role: string;
  }>;
  lastMessage: IMessage;
}

function MessagesContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetUserId = searchParams.get('userId');
  const adminUserId1 = searchParams.get('userId1');
  const adminUserId2 = searchParams.get('userId2');

  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [creatorPaymentDetails, setCreatorPaymentDetails] = useState<IPaymentDetails | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/messages/conversations');
      const data = await res.json();
      setConversations(data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const fetchMessages = useCallback(async () => {
    try {
      let url = '/api/messages';
      if (adminUserId1 && adminUserId2) {
        url += `?userId1=${adminUserId1}&userId2=${adminUserId2}`;
      } else {
        url += `?userId=${targetUserId}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setMessages(data);
    } catch (error) {
      console.error(error);
    }
  }, [adminUserId1, adminUserId2, targetUserId]);

  const fetchCreatorDetails = useCallback(async () => {
    try {
      const res = await fetch('/api/creators/me');
      const data = await res.json();
      setCreatorPaymentDetails(data.paymentDetails);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchConversations();
      let interval: NodeJS.Timeout;
      if (targetUserId || (adminUserId1 && adminUserId2)) {
        fetchMessages();
        interval = setInterval(fetchMessages, 5000);
      }
      if (session?.user?.role === 'creator') {
        fetchCreatorDetails();
      }
      return () => {
        if (interval) clearInterval(interval);
      };
    }
  }, [status, targetUserId, adminUserId1, adminUserId2, router, session?.user?.role, fetchConversations, fetchMessages, fetchCreatorDetails]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !targetUserId) return;

    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receiverId: targetUserId, content: newMessage }),
    });

    if (res.ok) {
      setNewMessage('');
      fetchMessages();
      fetchConversations();
    }
  };

  if (status === 'loading') return <div className="text-center py-20">Loading...</div>;

  const isAdmin = session?.user?.role === 'admin';

  return (
    <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 flex gap-6 overflow-hidden h-[calc(100vh-80px)]">
      {/* Conversation List */}
      <div className="w-1/3 bg-white rounded-[2rem] shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center gap-2">
          <MessageSquare className="text-primary" size={24} />
          <h2 className="text-xl font-black text-gray-900">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv, idx) => {
            const isSelected = isAdmin
              ? (conv.users?.some(u => u._id === adminUserId1) && conv.users?.some(u => u._id === adminUserId2))
              : conv.user?._id === targetUserId;

            return (
              <div
                key={idx}
                onClick={() => {
                  if (isAdmin) {
                    router.push(`/messages?userId1=${conv.users?.[0]._id}&userId2=${conv.users?.[1]._id}`);
                  } else {
                    router.push(`/messages?userId=${conv.user?._id}`);
                  }
                }}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition ${isSelected ? 'bg-primary/5 border-l-4 border-l-primary' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                    {conv.user?.profileImage ? (
                      <Image src={conv.user.profileImage} alt="" width={48} height={48} className="object-cover" />
                    ) : (
                      <User className="text-gray-400" size={24} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate">
                      {isAdmin ? `${conv.users?.[0].name} & ${conv.users?.[1].name}` : conv.user?.name}
                    </p>
                    <p className="text-sm text-gray-500 truncate leading-tight">{conv.lastMessage.content}</p>
                  </div>
                </div>
              </div>
            );
          })}
          {conversations.length === 0 && (
            <div className="text-center py-20 px-6">
               <MessageSquare size={40} className="mx-auto text-gray-200 mb-4" />
               <p className="text-gray-400 italic">No conversations yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        {(!targetUserId && !(adminUserId1 && adminUserId2)) ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
               <MessageSquare size={32} />
            </div>
            <p className="italic font-medium">Select a conversation to start messaging</p>
          </div>
        ) : (
          <>
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50/50">
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`flex ${msg.senderId === session?.user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] p-4 shadow-sm ${
                      msg.senderId === session?.user?.id
                        ? 'bg-primary text-white rounded-[1.5rem] rounded-tr-none'
                        : 'bg-white text-gray-800 rounded-[1.5rem] rounded-tl-none border border-gray-100'
                    }`}
                  >
                    <p className="text-[15px] leading-relaxed">{msg.content}</p>
                    <p className={`text-[10px] mt-1 font-medium uppercase tracking-wider ${msg.senderId === session?.user?.id ? 'text-blue-100' : 'text-gray-400'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              {messages.length === 0 && (
                <div className="text-center py-20">
                   <p className="text-gray-400 italic">Start the conversation...</p>
                </div>
              )}
            </div>

            {!isAdmin && (
              <form onSubmit={handleSendMessage} className="bg-white border-t border-gray-100 p-6 flex flex-col gap-4">
                {session?.user?.role === 'creator' && creatorPaymentDetails && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const text = `My Payment Details:\nCashApp: ${creatorPaymentDetails.cashapp || 'Not set'}\nCrypto: ${creatorPaymentDetails.crypto || 'Not set'}`;
                        setNewMessage(text);
                      }}
                      className="text-xs bg-gray-100 hover:bg-primary/10 hover:text-primary font-bold text-gray-600 px-4 py-2 rounded-full flex items-center gap-2 transition-all"
                    >
                      <CreditCard size={14} /> Send Payment Info
                    </button>
                  </div>
                )}
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-50 border-none rounded-full px-6 py-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                  />
                  <button
                    type="submit"
                    className="bg-primary text-white p-3 rounded-full hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all active:scale-95"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </form>
            )}
            {isAdmin && (
              <div className="bg-gray-100 p-4 text-center text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">
                Read-only Admin View
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default function Messages() {
  return (
    <div className="min-h-screen flex flex-col h-screen overflow-hidden">
      <Suspense fallback={<div className="text-center py-20">Loading messages...</div>}>
        <MessagesContent />
      </Suspense>
    </div>
  );
}
