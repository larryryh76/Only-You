'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  CheckCircle2,
  Lock,
  X,
  Share2,
  ArrowLeft,
  FileText,
  Star
} from 'lucide-react';
import Image from 'next/image';
import { formatCompactNumber } from '@/lib/formatters';

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
  subscriptionPrice?: number;
  coverImage?: string;
  isVerified?: boolean;
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
  const [activeTab, setActiveTab] = useState('posts');

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      alert('Profile link copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

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
    if (!session) {
      router.push('/login');
      return;
    }

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

  const handleSubscribeClick = () => {
    if (!session) {
      router.push('/login');
    } else {
      setShowSubModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header / Nav */}
      <div className="sticky top-0 z-40 bg-white flex items-center justify-between px-4 py-2 border-b border-gray-100">
        <div className="flex items-center gap-6">
          <button onClick={() => router.back()} className="text-of-dark hover:bg-gray-100 p-2 rounded-full transition">
            <ArrowLeft size={24} />
          </button>
          <div>
            <div className="flex items-center gap-1">
              <h2 className="font-bold text-lg leading-tight">{creator.name}</h2>
              {creator.isVerified && <CheckCircle2 size={18} className="text-of-dark" />}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button
              className="p-2 hover:bg-gray-100 rounded-full transition"
           >
              <Star size={24} className="text-of-dark" />
           </button>
           <button
              onClick={handleShare}
              className="p-2 hover:bg-gray-100 rounded-full transition"
           >
              <Share2 size={24} className="text-of-dark" />
           </button>
        </div>
      </div>

      {/* Cover Image */}
      <div className="relative h-48 md:h-64 bg-gray-200 overflow-hidden">
        {creator.coverImage ? (
          <Image
            src={creator.coverImage}
            alt=""
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-gray-300 to-gray-400"></div>
        )}
      </div>

      {/* Profile Info */}
      <div className="px-4 relative">
        <div className="flex justify-between items-start -mt-16 mb-2">
          <div className="relative">
            <div className="w-28 h-28 rounded-full border-4 border-white bg-gray-100 overflow-hidden relative">
              {creator.profileImage ? (
                <Image
                  src={creator.profileImage}
                  alt={creator.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary text-white text-4xl font-bold">
                  {creator.name[0]}
                </div>
              )}
            </div>
            <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
          </div>
          <div className="flex gap-3 mt-16">
             <button
                className="p-2 border border-gray-200 rounded-full hover:bg-gray-50 transition"
              >
                <Star size={24} className="text-primary" />
             </button>
             <button
                onClick={handleShare}
                className="p-2 border border-gray-200 rounded-full hover:bg-gray-50 transition"
              >
                <Share2 size={24} className="text-primary" />
             </button>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-1">
            <h1 className="text-xl font-bold text-of-dark">{creator.name} {creator.isVerified && <CheckCircle2 size={18} className="inline text-of-dark" />}</h1>
          </div>
          <div className="flex items-center gap-1 text-of-gray text-[15px]">
            <span>@{creator.username}</span>
            <span className="text-[8px]">●</span>
            <span>Available now</span>
          </div>
        </div>

        <div className="text-of-dark text-base mb-6">
          {creator.bio || '🐒'}
        </div>

        {/* Subscription Card */}
        <div className="border-t border-gray-100 -mx-4 px-4 py-4 bg-white">
          <p className="text-[13px] font-bold text-of-gray uppercase tracking-tight mb-3">Subscription</p>

          <div className="space-y-4">
             <p className="font-bold text-lg text-of-dark">Limited offer - 35% off for 28 days!</p>

             {subStatus === 'active' ? (
                <button disabled className="w-full bg-green-500 text-white py-3.5 rounded-full font-bold flex justify-between px-8 items-center text-sm uppercase tracking-wider">
                   <span>SUBSCRIBED</span>
                   <span>ACTIVE</span>
                </button>
             ) : subStatus === 'pending' ? (
                <button disabled className="w-full bg-orange-400 text-white py-3.5 rounded-full font-bold flex justify-between px-8 items-center text-sm uppercase tracking-wider">
                   <span>PENDING APPROVAL</span>
                   <span>WAITING</span>
                </button>
             ) : (
                <button
                  onClick={handleSubscribeClick}
                  className="w-full bg-primary text-white py-3.5 rounded-full font-bold flex justify-between px-8 items-center hover:bg-primary-hover transition text-sm uppercase tracking-wider shadow-sm"
                >
                   <span>SUBSCRIBE</span>
                   <span>${((creator.subscriptionPrice || 4.99) * 0.65).toFixed(2)} for 28 days</span>
                </button>
             )}
             <p className="text-of-gray text-sm">Regular price ${(creator.subscriptionPrice || 4.99).toFixed(2)} /month</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 -mx-4">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-4 text-[13px] font-bold uppercase tracking-wider ${activeTab === 'posts' ? 'text-primary border-b-2 border-primary' : 'text-of-gray'}`}
          >
            {formatCompactNumber(posts.length)} Posts
          </button>
          <button
            onClick={() => setActiveTab('media')}
            className={`flex-1 py-4 text-[13px] font-bold uppercase tracking-wider ${activeTab === 'media' ? 'text-primary border-b-2 border-primary' : 'text-of-gray'}`}
          >
            Media
          </button>
        </div>

        {/* Content Area */}
        {subStatus === 'active' || (session && session.user.id === creator._id) || (session && session.user.role === 'admin') ? (
          <div className="py-6 space-y-6">
            {posts.map((post) => (
              <div key={post._id} className="border-b border-gray-100 pb-6 px-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden relative border border-gray-100">
                    {creator.profileImage ? (
                      <Image src={creator.profileImage} alt="" fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary text-white font-bold">{creator.name[0]}</div>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{creator.name}</p>
                    <p className="text-of-gray text-xs">{new Date(post.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="mb-4 whitespace-pre-wrap text-of-dark">
                  {post.content}
                </div>

                {post.mediaUrl && (
                  <div className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden shadow-inner">
                    {post.mediaUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                      <video src={post.mediaUrl} controls className="w-full h-full object-cover" />
                    ) : (
                      <Image src={post.mediaUrl} alt="" fill className="object-cover" />
                    )}
                  </div>
                )}
              </div>
            ))}
            {posts.length === 0 && (
              <div className="text-center py-20 text-of-gray font-bold">No posts yet.</div>
            )}
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center bg-gray-50/30 -mx-4 px-4">
            <div className="text-gray-200 mb-10">
               <Lock size={100} strokeWidth={1} />
            </div>

            <div className="border border-gray-100 rounded-xl p-4 w-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
               <div className="flex justify-between items-center mb-8 px-2">
                  <div className="flex items-center gap-2 text-of-gray">
                     <FileText size={18} />
                     <span className="text-sm font-bold">{posts.length}</span>
                  </div>
                  <Lock size={18} className="text-of-gray" />
               </div>

               <button
                  onClick={handleSubscribeClick}
                  className="w-full bg-primary text-white py-4 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-primary-hover transition"
               >
                  SUBSCRIBE TO SEE USER&apos;S POSTS
               </button>
            </div>
          </div>
        )}
      </div>

      {/* Subscription Modal */}
      {showSubModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setShowSubModal(false)}
              className="absolute right-4 top-4 text-of-gray hover:text-of-dark transition"
            >
              <X size={24} />
            </button>

            <h2 className="text-2xl font-bold text-of-dark mb-1">Support {creator.name}</h2>
            <p className="text-of-gray text-sm mb-6">Choose payment method to unlock content</p>

            <div className="mb-6 p-4 bg-primary/5 rounded-2xl border border-primary/10">
              <p className="text-center font-bold text-primary text-xl">
                ${creator.subscriptionPrice || 0} / month
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <div
                onClick={() => setPaymentMethod('cashapp')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${paymentMethod === 'cashapp' ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-gray-200'}`}
              >
                <p className="font-bold text-of-dark mb-1">Cash App</p>
                <p className="text-primary font-mono font-bold">{creator.paymentDetails?.cashapp || '$NotSet'}</p>
              </div>

              <div
                onClick={() => setPaymentMethod('crypto')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${paymentMethod === 'crypto' ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-gray-200'}`}
              >
                <p className="font-bold text-of-dark mb-1">Crypto (BTC/ETH)</p>
                <p className="text-xs text-primary font-mono break-all leading-tight">{creator.paymentDetails?.crypto || 'Address not set'}</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold text-of-gray uppercase tracking-wider mb-2">Payment Proof / ID</label>
              <input
                type="text"
                value={paymentProof}
                onChange={(e) => setPaymentProof(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-primary transition"
                placeholder="Transaction ID or CashTag"
              />
            </div>

            <button
              onClick={handleSubscribe}
              className="w-full py-4 bg-primary text-white rounded-full font-bold uppercase tracking-wider hover:bg-primary-hover transition shadow-lg shadow-primary/20"
            >
              Submit for Approval
            </button>
          </div>
        </div>
      )}

      {/* Spacing for mobile nav */}
      <div className="h-20 md:hidden"></div>
    </div>
  );
}
