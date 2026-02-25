'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { CheckCircle, Lock, MessageCircle, X } from 'lucide-react';
import Link from 'next/link';
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
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto py-8 px-6">
        {/* Cover Image */}
        <div className="h-56 md:h-80 bg-of-light rounded-t-3xl shadow-inner relative overflow-hidden">
          {creator.coverImage ? (
            <Image
              src={creator.coverImage}
              alt=""
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary to-primary-hover"></div>
          )}
        </div>

        <div className="bg-white p-6 md:p-8 rounded-b-3xl shadow-xl border border-gray-100 -mt-12 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
            <div className="w-32 h-32 md:w-36 md:h-36 bg-gray-100 border-8 border-white rounded-full overflow-hidden shadow-2xl transform transition-transform hover:scale-105">
              {creator.profileImage ? (
                <Image
                  src={creator.profileImage}
                  alt={creator.name}
                  width={144}
                  height={144}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary text-white text-5xl font-black">
                  {creator.name[0]}
                </div>
              )}
            </div>
            <div className="flex gap-3 md:gap-4 w-full md:w-auto">
              <Link
                href={`/messages?userId=${creator._id}`}
                className="p-3.5 rounded-full border border-of-light hover:bg-of-light text-of-gray hover:text-primary transition shadow-md"
              >
                <MessageCircle size={26} />
              </Link>

              {subStatus === 'active' ? (
                <button disabled className="flex-1 md:flex-none bg-green-500 text-white px-6 md:px-10 py-3.5 rounded-full font-black uppercase text-xs tracking-widest opacity-90 cursor-default shadow-lg shadow-green-100">
                  Subscribed
                </button>
              ) : subStatus === 'pending' ? (
                <button disabled className="flex-1 md:flex-none bg-orange-400 text-white px-6 md:px-10 py-3.5 rounded-full font-black uppercase text-xs tracking-widest opacity-90 cursor-default shadow-lg shadow-orange-100">
                  Pending Approval
                </button>
              ) : (
                <button
                  onClick={() => session ? setShowSubModal(true) : router.push('/login')}
                  className="flex-1 md:flex-none bg-primary text-white px-6 md:px-10 py-3.5 rounded-full font-black uppercase text-xs tracking-widest hover:bg-primary-hover transition shadow-xl shadow-primary/30"
                >
                  Subscribe
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-4xl font-black text-of-dark tracking-tight">{creator.name}</h1>
            {creator.isVerified && <CheckCircle className="text-primary fill-current" size={28} />}
          </div>
          <p className="text-of-gray font-black mb-6 italic">@{creator.username}</p>
          <p className="text-of-dark/80 max-w-2xl mb-8 leading-relaxed font-medium">
            {creator.bio || 'Welcome to my exclusive space. Subscribe to unlock all my posts and message me directly!'}
          </p>

          <div className="flex gap-12 border-t border-of-light pt-8">
            <div className="text-center">
              <p className="font-black text-of-dark text-2xl">{posts.length}</p>
              <p className="text-[10px] uppercase tracking-widest text-of-gray font-bold mt-1">Posts</p>
            </div>
            <div className="text-center">
              <p className="font-black text-of-dark text-2xl">{formatCompactNumber(creator.displayFollowerCount || 0)}</p>
              <p className="text-[10px] uppercase tracking-widest text-of-gray font-bold mt-1">Followers</p>
            </div>
          </div>
        </div>

        {/* Subscription Modal */}
        {showSubModal && (
          <div className="fixed inset-0 bg-of-dark/80 backdrop-blur-md flex items-center justify-center z-[100] p-6">
            <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
              <button
                onClick={() => setShowSubModal(false)}
                className="absolute right-6 top-6 text-of-gray hover:text-of-dark transition"
              >
                <X size={28} />
              </button>

              <h2 className="text-3xl font-black text-of-dark mb-2 tracking-tight">Support {creator.name}</h2>
              <div className="mb-8 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                <p className="text-center font-black text-primary text-2xl uppercase tracking-widest">
                  ${creator.subscriptionPrice || 0} / month
                </p>
              </div>
              <p className="text-of-gray mb-10 font-medium">Choose your payment method to get instant access.</p>

              <div className="space-y-4 mb-10">
                <div
                  onClick={() => setPaymentMethod('cashapp')}
                  className={`p-6 rounded-3xl border-2 transition-all duration-200 cursor-pointer ${paymentMethod === 'cashapp' ? 'border-primary bg-primary/5 shadow-md' : 'border-of-light hover:border-of-gray/30'}`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-black text-of-dark text-lg tracking-tight">Cash App</p>
                    {paymentMethod === 'cashapp' && <CheckCircle size={20} className="text-primary fill-current text-white" />}
                  </div>
                  <p className="text-lg text-primary font-black font-mono bg-white inline-block px-3 py-1 rounded-xl border border-primary/10">{creator.paymentDetails?.cashapp || '$NotSet'}</p>
                </div>

                <div
                  onClick={() => setPaymentMethod('crypto')}
                  className={`p-6 rounded-3xl border-2 transition-all duration-200 cursor-pointer ${paymentMethod === 'crypto' ? 'border-primary bg-primary/5 shadow-md' : 'border-of-light hover:border-of-gray/30'}`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-black text-of-dark text-lg tracking-tight">Crypto (BTC/ETH)</p>
                    {paymentMethod === 'crypto' && <CheckCircle size={20} className="text-primary fill-current text-white" />}
                  </div>
                  <p className="text-xs text-primary font-black font-mono break-all bg-white p-3 rounded-xl border border-primary/10 leading-tight">{creator.paymentDetails?.crypto || 'Address not set'}</p>
                </div>
              </div>

              <div className="mb-10">
                <label className="block text-xs uppercase tracking-widest font-black text-of-gray mb-3 px-1">Payment Proof / Transaction ID</label>
                <input
                  type="text"
                  value={paymentProof}
                  onChange={(e) => setPaymentProof(e.target.value)}
                  className="w-full border-2 border-of-light rounded-2xl px-6 py-4 outline-none focus:border-primary bg-of-light font-bold transition-colors"
                  placeholder="e.g. #ABC-123-XYZ"
                />
              </div>

              <button
                onClick={handleSubscribe}
                className="w-full py-5 bg-primary text-white rounded-3xl font-black text-lg uppercase tracking-widest hover:bg-primary-hover transition shadow-xl shadow-primary/30"
              >
                Submit for Approval
              </button>
            </div>
          </div>
        )}

        <div className="mt-12 space-y-10">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-black text-of-dark tracking-tight">Recent Posts</h2>
            <div className="h-0.5 flex-1 bg-of-light"></div>
          </div>

          {posts.map((post: Post) => (
            <div key={post._id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-of-light transition-shadow hover:shadow-md">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-of-light rounded-full overflow-hidden shadow-inner">
                   {creator.profileImage ? (
                     <Image
                       src={creator.profileImage}
                       alt={creator.name}
                       width={56}
                       height={56}
                       className="w-full h-full object-cover"
                     />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center bg-primary text-white font-black text-xl">{creator.name[0]}</div>
                   )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-black text-of-dark text-lg tracking-tight">{creator.name}</p>
                    <CheckCircle className="text-primary fill-current" size={16} />
                  </div>
                  <p className="text-of-gray text-[10px] uppercase font-bold tracking-widest">{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>

              {post.isLocked ? (
                <div className="relative rounded-[2rem] overflow-hidden border border-of-light min-h-[400px] flex items-center justify-center group">
                  {/* Blurred Content Preview */}
                  <div className="absolute inset-0 bg-gray-100">
                     <div className="absolute inset-0 bg-gradient-to-br from-of-dark to-primary opacity-20"></div>
                     <div className="absolute inset-0 flex items-center justify-center opacity-5">
                        <Image
                          src="/logo.jpg"
                          alt=""
                          width={400}
                          height={100}
                          className="grayscale brightness-0"
                        />
                     </div>
                  </div>

                  {/* Glassmorphism Overlay */}
                  <div className="absolute inset-0 bg-white/30 backdrop-blur-[60px] z-10"></div>

                  {/* Content Overlay */}
                  <div className="relative flex flex-col items-center justify-center text-center p-12 z-20">
                    <div className="bg-white p-8 rounded-full mb-8 shadow-2xl transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-12">
                      <Lock size={64} className="text-primary" />
                    </div>
                    <h3 className="font-black text-of-dark text-4xl mb-4 tracking-tighter uppercase">Subscribe to See Content</h3>
                    <p className="font-bold text-of-gray max-w-sm leading-relaxed mb-10 text-lg italic">
                      Join {creator.name}&apos;s exclusive club to unlock this post and {posts.length} other items.
                    </p>
                    <button
                       onClick={() => session ? setShowSubModal(true) : router.push('/login')}
                       className="bg-primary text-white px-12 py-5 rounded-full font-black uppercase text-sm tracking-widest hover:bg-primary-hover transition-all shadow-2xl shadow-primary/40 transform hover:-translate-y-1"
                    >
                      Unlock for ${creator.subscriptionPrice || 0}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-of-dark/90 mb-8 leading-relaxed text-xl font-medium">{post.content}</p>
                  {post.mediaUrl && (
                    <div className="rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl">
                      <Image
                        src={post.mediaUrl}
                        alt="Post content"
                        width={800}
                        height={600}
                        className="w-full object-cover max-h-[700px] transition-transform duration-700 hover:scale-105"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
          {posts.length === 0 && (
            <div className="text-center py-24 bg-white rounded-[2.5rem] border border-of-light shadow-inner">
              <p className="text-of-gray font-bold italic text-lg tracking-tight">Nothing shared here yet...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
