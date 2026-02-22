'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import { CheckCircle, Lock, MessageCircle, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Post {
  _id: string;
  content: string;
  mediaUrl?: string;
  isPremium: boolean;
  createdAt: string;
  isLocked?: boolean;
}

interface Creator {
  _id: string;
  name: string;
  username: string;
  profileImage?: string;
  bio?: string;
  displayFollowerCount?: number;
  paymentDetails?: {
    cashapp?: string;
    crypto?: string;
  };
}

export default function CreatorProfile() {
  const { username } = useParams();
  const { data: session } = useSession();
  const router = useRouter();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubModal, setShowSubModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cashapp');
  const [paymentProof, setPaymentProof] = useState('');
  const [subStatus, setSubStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;

    const fetchData = async () => {
      try {
        const creatorRes = await fetch(`/api/creators/${username}`);
        if (!creatorRes.ok) throw new Error('Creator not found');
        const creatorData = await creatorRes.json();
        setCreator(creatorData);

        const postsRes = await fetch(`/api/posts?creatorId=${creatorData._id}`);
        const postsData = await postsRes.json();
        setPosts(postsData);

        if (session) {
          const subRes = await fetch('/api/subscriptions');
          const subData = await subRes.json();
          const activeSub = subData.find((s: { creatorId: { _id: string } | string; status: string }) => {
            const cid = typeof s.creatorId === 'string' ? s.creatorId : s.creatorId._id;
            return cid === creatorData._id && s.status !== 'expired';
          });
          if (activeSub) setSubStatus(activeSub.status);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username, session]);

  if (loading) return <div className="text-center py-20 font-medium text-gray-500">Loading profile...</div>;
  if (!creator) return <div className="text-center py-20 text-red-500 font-bold text-xl">Creator not found</div>;

  const handleSubscribe = async () => {
    if (!paymentProof) {
      alert('Please provide payment proof');
      return;
    }

    const res = await fetch('/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creatorId: creator._id, paymentMethod, paymentProof }),
    });

    if (res.ok) {
      setShowSubModal(false);
      setSubStatus('pending');
      alert('Subscription requested! Waiting for approval.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto py-8 px-6">
        {/* Cover Image Placeholder */}
        <div className="h-48 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-t-2xl"></div>

        <div className="bg-white p-8 rounded-b-2xl shadow-sm border border-gray-100 -mt-10 relative">
          <div className="flex justify-between items-end mb-6">
            <div className="w-32 h-32 bg-gray-300 border-4 border-white rounded-full overflow-hidden">
              {creator.profileImage ? (
                <Image
                  src={creator.profileImage}
                  alt={creator.name}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-400 text-white text-4xl font-bold">
                  {creator.name[0]}
                </div>
              )}
            </div>
            <div className="flex gap-4">
              <Link
                href={`/messages?userId=${creator._id}`}
                className="p-3 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-600 transition shadow-sm"
              >
                <MessageCircle size={24} />
              </Link>

              {subStatus === 'active' ? (
                <button disabled className="bg-green-600 text-white px-8 py-3 rounded-full font-bold opacity-90 cursor-default">
                  Subscribed
                </button>
              ) : subStatus === 'pending' ? (
                <button disabled className="bg-orange-500 text-white px-8 py-3 rounded-full font-bold opacity-90 cursor-default">
                  Pending Approval
                </button>
              ) : (
                <button
                  onClick={() => session ? setShowSubModal(true) : router.push('/login')}
                  className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                >
                  Subscribe to View
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 mb-1">
            <h1 className="text-3xl font-bold text-gray-900">{creator.name}</h1>
            <CheckCircle className="text-blue-500 fill-current" size={24} />
          </div>
          <p className="text-gray-500 mb-4">@{creator.username}</p>
          <p className="text-gray-700 max-w-2xl mb-6 leading-relaxed">{creator.bio || 'No bio available yet.'}</p>

          <div className="flex gap-8 border-t border-gray-100 pt-6">
            <div className="text-center">
              <p className="font-bold text-gray-900 text-xl">{posts.length}</p>
              <p className="text-gray-500 text-xs uppercase tracking-wider">Posts</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-gray-900 text-xl">{creator.displayFollowerCount || 0}</p>
              <p className="text-gray-500 text-xs uppercase tracking-wider">Followers</p>
            </div>
          </div>
        </div>

        {/* Subscription Modal */}
        {showSubModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-6">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
              <button
                onClick={() => setShowSubModal(false)}
                className="absolute right-6 top-6 text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>

              <h2 className="text-2xl font-extrabold mb-2">Subscribe to {creator.name}</h2>
              <p className="text-gray-600 mb-8 text-sm">Follow instructions below to unlock exclusive content.</p>

              <div className="space-y-4 mb-8">
                <div
                  onClick={() => setPaymentMethod('cashapp')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition ${paymentMethod === 'cashapp' ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:border-gray-200'}`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-bold text-gray-900">Cash App</p>
                    {paymentMethod === 'cashapp' && <CheckCircle size={18} className="text-blue-600" />}
                  </div>
                  <p className="text-sm text-blue-600 font-mono font-bold">{creator.paymentDetails?.cashapp || '$NotSet'}</p>
                </div>

                <div
                  onClick={() => setPaymentMethod('crypto')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition ${paymentMethod === 'crypto' ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:border-gray-200'}`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-bold text-gray-900">Crypto (BTC/ETH)</p>
                    {paymentMethod === 'crypto' && <CheckCircle size={18} className="text-blue-600" />}
                  </div>
                  <p className="text-xs text-blue-600 font-mono break-all">{creator.paymentDetails?.crypto || 'Address not set'}</p>
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-sm font-bold text-gray-700 mb-2">Payment Proof / Transaction ID</label>
                <input
                  type="text"
                  value={paymentProof}
                  onChange={(e) => setPaymentProof(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  placeholder="Paste transaction ID or note here"
                />
              </div>

              <button
                onClick={handleSubscribe}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200"
              >
                Submit for Approval
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Posts</h2>
          {posts.map((post: Post) => (
            <div key={post._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                   {creator.profileImage ? (
                     <Image
                       src={creator.profileImage}
                       alt={creator.name}
                       width={48}
                       height={48}
                       className="w-full h-full object-cover"
                     />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600 font-bold">{creator.name[0]}</div>
                   )}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <p className="font-bold text-gray-900">{creator.name}</p>
                    <CheckCircle className="text-blue-500 fill-current" size={14} />
                  </div>
                  <p className="text-gray-500 text-xs">{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>

              {post.isLocked ? (
                <div className="bg-gray-50 rounded-2xl py-20 flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-gray-200">
                  <div className="bg-gray-200 p-4 rounded-full mb-4">
                    <Lock size={32} className="text-gray-400" />
                  </div>
                  <p className="font-bold text-gray-900 text-lg mb-1">Unlock this post</p>
                  <p className="text-sm">Subscribe to see {creator.name}'s exclusive content</p>
                </div>
              ) : (
                <>
                  <p className="text-gray-800 mb-6 leading-relaxed text-lg">{post.content}</p>
                  {post.mediaUrl && (
                    <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                      <Image
                        src={post.mediaUrl}
                        alt="Post content"
                        width={800}
                        height={600}
                        className="w-full object-cover max-h-[600px]"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
          {posts.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <p className="text-gray-500 italic">No posts yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
