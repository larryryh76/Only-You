'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Users,
  User,
  CheckCircle,
  Clock,
  XCircle,
  CreditCard,
  PlusSquare,
  Eye,
  MessageSquare,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut
} from 'lucide-react';
import Image from 'next/image';
import { formatCompactNumber } from '@/lib/formatters';

interface ISubscription {
  _id: string;
  userId: { _id: string; name: string; email: string };
  creatorId: { _id: string; name: string; username: string };
  status: 'pending' | 'active' | 'expired';
  paymentMethod: string;
  paymentProof: string;
  createdAt: string;
}

interface ICreator {
  _id: string;
  name: string;
  username: string;
  isVerified: boolean;
  subscriptionPrice?: number;
  profileImage?: string;
  coverImage?: string;
  bio?: string;
  displayFollowerCount?: number;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [subscriptions, setSubscriptions] = useState<ISubscription[]>([]);
  const [creators, setCreators] = useState<ICreator[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostMedia, setNewPostMedia] = useState('');
  const [paymentDetails, setPaymentDetails] = useState({ cashapp: '', crypto: '' });
  const [creatorPrice, setCreatorPrice] = useState(0);
  const [showCreateCreator, setShowCreateCreator] = useState(false);
  const [newCreator, setNewCreator] = useState({
    name: '',
    email: '',
    password: '',
    username: '',
    bio: '',
    displayFollowerCount: 0,
    subscriptionPrice: 0,
    profileImage: '',
    coverImage: '',
    isVerified: true,
  });

  const [editingCreator, setEditingCreator] = useState<ICreator | null>(null);
  const [creatorProfile, setCreatorProfile] = useState({ bio: '', profileImage: '', coverImage: '' });

  const fetchDashboardData = useCallback(async () => {
    const res = await fetch('/api/subscriptions');
    const data = await res.json();
    setSubscriptions(data);

    if (session?.user?.role === 'admin') {
      const creatorsRes = await fetch('/api/creators');
      const creatorsData = await creatorsRes.json();
      setCreators(creatorsData);
    }

    if (session?.user?.role === 'creator') {
      const meRes = await fetch('/api/creators/me');
      const meData = await meRes.json();
      setPaymentDetails(meData.paymentDetails || { cashapp: '', crypto: '' });
      setCreatorPrice(meData.subscriptionPrice || 0);
      setCreatorProfile({
        bio: meData.bio || '',
        profileImage: meData.profileImage || '',
        coverImage: meData.coverImage || '',
      });
    }
  }, [session]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user) {
      setRole(session.user.role);
      fetchDashboardData();
    }
  }, [status, session, router, fetchDashboardData]);

  const handleApproveSubscription = async (subId: string, approved: boolean) => {
    await fetch('/api/subscriptions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscriptionId: subId,
        status: approved ? 'active' : 'expired',
      }),
    });
    fetchDashboardData();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'profileImage' | 'coverImage' | 'newPostMedia') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        if (field === 'newPostMedia') {
          setNewPostMedia(data.url);
        } else {
          setCreatorProfile({ ...creatorProfile, [field]: data.url });
        }
      }
    } catch (err) {
      console.error('Upload failed', err);
    }
  };

  const handleUpdateCreatorProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/creators/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...creatorProfile,
        paymentDetails,
        subscriptionPrice: creatorPrice
      }),
    });
    if (res.ok) alert('Profile updated!');
  };

  const handleAdminUpdateCreator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCreator) return;
    const res = await fetch(`/api/creators/${editingCreator.username}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingCreator),
    });
    if (res.ok) {
      setEditingCreator(null);
      fetchDashboardData();
      alert('Creator updated!');
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: newPostContent,
        mediaUrl: newPostMedia,
        isPremium: true
      }),
    });
    if (res.ok) {
      setNewPostContent('');
      setNewPostMedia('');
      alert('Post created!');
    }
  };

  const handleCreateCreator = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/creators', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCreator),
    });
    if (res.ok) {
      setShowCreateCreator(false);
      setNewCreator({
        name: '', email: '', password: '', username: '', bio: '',
        displayFollowerCount: 0, subscriptionPrice: 0, profileImage: '',
        coverImage: '', isVerified: true
      });
      fetchDashboardData();
      alert('Creator created successfully!');
    } else {
      const data = await res.json();
      alert(data.message);
    }
  };

  if (status === 'loading') return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="min-h-screen">
      <main className="max-w-6xl mx-auto py-6 md:py-10 px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="bg-primary p-3 rounded-2xl shadow-lg shadow-primary/20">
              <LayoutDashboard className="text-white" size={32} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-black text-of-dark tracking-tight uppercase">{role}</h1>
                <button
                  onClick={() => signOut()}
                  className="p-2 text-of-gray hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  title="Sign Out"
                >
                  <LogOut size={24} />
                </button>
              </div>
              <p className="text-of-gray font-bold text-sm tracking-widest">CONTROL PANEL</p>
            </div>
          </div>
          {role === 'creator' && session?.user?.username && (
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  const url = `${window.location.origin}/${session.user.username}`;
                  navigator.clipboard.writeText(url);
                  alert('Profile link copied to clipboard!');
                }}
                className="bg-primary text-white px-6 py-3 rounded-full font-black uppercase text-xs tracking-widest hover:bg-primary-hover transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
              >
                Copy Profile Link
              </button>
              <Link
                href={`/${session.user.username}`}
                className="bg-of-light text-primary px-6 py-3 rounded-full font-black uppercase text-xs tracking-widest hover:bg-white border border-primary/20 transition-all flex items-center gap-2"
              >
                <Eye size={18} /> View My Public Profile
              </Link>
            </div>
          )}
        </div>

        {role === 'creator' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-10">
              {/* Create Post */}
              <section className="bg-white p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-xl border border-of-light relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-primary"></div>
                <h2 className="text-xl md:text-2xl font-black text-of-dark mb-6 flex items-center gap-3 tracking-tight">
                  <PlusSquare className="text-primary" /> Create New Post
                </h2>
                <form onSubmit={handleCreatePost}>
                  <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    className="w-full border-2 border-of-light rounded-2xl md:rounded-3xl p-4 md:p-6 min-h-[120px] mb-4 focus:border-primary outline-none bg-of-light/30 font-medium transition-colors"
                    placeholder="Share something exclusive with your fans..."
                  ></textarea>
                  <div className="mb-6">
                    <label className="block text-[10px] font-black text-of-gray uppercase tracking-widest mb-1 ml-1">Upload Media from Gallery</label>
                    <div className="mt-2 flex items-center gap-4">
                      <label className="bg-of-light border-2 border-dashed border-primary/30 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-all w-full group">
                        <PlusSquare className="text-primary group-hover:scale-110 transition-transform mb-2" size={32} />
                        <span className="text-xs font-black uppercase text-primary tracking-widest">Select from Gallery</span>
                        <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'newPostMedia')} accept="image/*,video/*" />
                      </label>
                      {newPostMedia && (
                        <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-primary relative flex-shrink-0">
                           {newPostMedia.startsWith('data:video') ? (
                             <video src={newPostMedia} className="w-full h-full object-cover" />
                           ) : (
                             <Image src={newPostMedia} alt="Preview" fill className="object-cover" />
                           )}
                        </div>
                      )}
                    </div>
                  </div>
                  <button className="bg-primary text-white px-10 py-4 rounded-full font-black uppercase text-xs tracking-widest hover:bg-primary-hover transition shadow-lg shadow-primary/30">
                    Post to Subscribers
                  </button>
                </form>
              </section>

              {/* Subscription Approvals */}
              <section className="bg-white p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-xl border border-of-light">
                <h2 className="text-xl md:text-2xl font-black text-of-dark mb-6 flex items-center gap-3 tracking-tight">
                  <Clock className="text-orange-400" /> Pending Approvals
                </h2>
                <div className="space-y-4">
                  {subscriptions.filter((s) => s.status === 'pending').map((sub) => (
                    <div key={sub._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 md:p-6 bg-of-light/50 rounded-2xl md:rounded-3xl border border-of-light group hover:bg-white hover:shadow-md transition-all gap-4">
                      <div>
                        <p className="font-black text-of-dark text-lg tracking-tight">{sub.userId.name}</p>
                        <div className="flex items-center gap-3 mt-1">
                           <span className="text-[10px] uppercase font-black text-of-gray tracking-tighter bg-white px-2 py-0.5 rounded border border-of-light">{sub.paymentMethod}</span>
                           <p className="text-xs font-bold text-primary font-mono">{sub.paymentProof}</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleApproveSubscription(sub._id, true)}
                          className="bg-white text-green-500 p-3 rounded-2xl hover:bg-green-500 hover:text-white transition shadow-sm border border-green-100"
                        >
                          <CheckCircle size={24} />
                        </button>
                        <button
                          onClick={() => handleApproveSubscription(sub._id, false)}
                          className="bg-white text-red-400 p-3 rounded-2xl hover:bg-red-400 hover:text-white transition shadow-sm border border-red-50"
                        >
                          <XCircle size={24} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {subscriptions.filter((s) => s.status === 'pending').length === 0 && (
                    <div className="text-center py-10 border-2 border-dashed border-of-light rounded-3xl">
                       <p className="text-of-gray font-bold italic">No pending fan subscriptions.</p>
                    </div>
                  )}
                </div>
              </section>
            </div>

            <div className="space-y-10">
              <section className="bg-white p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-xl border border-of-light">
                <h2 className="text-xl font-black text-of-dark mb-6 flex items-center gap-3 tracking-tight">
                  <User className="text-primary" /> Profile & Payout
                </h2>
                <form onSubmit={handleUpdateCreatorProfile} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-of-gray uppercase tracking-widest mb-1 ml-1">Profile Image</label>
                    <div className="flex items-center gap-4 mt-2">
                       <div className="w-16 h-16 rounded-full overflow-hidden bg-of-light border-2 border-of-light flex-shrink-0 relative">
                          {creatorProfile.profileImage ? (
                            <Image src={creatorProfile.profileImage} alt="Profile" fill className="object-cover" />
                          ) : <User className="w-full h-full p-3 text-of-gray" />}
                       </div>
                       <label className="bg-primary text-white px-4 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest cursor-pointer hover:bg-primary-hover transition shadow-md shadow-primary/20">
                          Choose Image
                          <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'profileImage')} accept="image/*" />
                       </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-of-gray uppercase tracking-widest mb-1 ml-1">Cover Image</label>
                    <div className="mt-2 space-y-4">
                       <div className="w-full h-24 rounded-2xl overflow-hidden bg-of-light border-2 border-of-light relative">
                          {creatorProfile.coverImage ? (
                            <Image src={creatorProfile.coverImage} alt="Cover" fill className="object-cover" />
                          ) : <PlusSquare className="w-full h-full p-6 text-of-gray opacity-20" />}
                       </div>
                       <label className="bg-primary text-white px-4 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest cursor-pointer hover:bg-primary-hover transition shadow-md shadow-primary/20 inline-block">
                          Choose Cover
                          <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'coverImage')} accept="image/*" />
                       </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-of-gray uppercase tracking-widest mb-2 ml-1">Bio</label>
                    <textarea
                      value={creatorProfile.bio}
                      onChange={(e) => setCreatorProfile({ ...creatorProfile, bio: e.target.value })}
                      className="w-full border-2 border-of-light rounded-2xl p-4 focus:border-primary outline-none bg-of-light/30 font-bold transition-colors text-sm min-h-[80px]"
                      placeholder="Tell your fans about yourself..."
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-of-gray uppercase tracking-widest mb-2 ml-1">Subscription Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={creatorPrice}
                      onChange={(e) => setCreatorPrice(parseFloat(e.target.value))}
                      className="w-full border-2 border-of-light rounded-2xl p-4 focus:border-primary outline-none bg-of-light/30 font-bold transition-colors text-sm"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-of-gray uppercase tracking-widest mb-2 ml-1">Cash App Tag</label>
                    <input
                      type="text"
                      value={paymentDetails.cashapp}
                      onChange={(e) => setPaymentDetails({ ...paymentDetails, cashapp: e.target.value })}
                      className="w-full border-2 border-of-light rounded-2xl p-4 focus:border-primary outline-none bg-of-light/30 font-bold transition-colors"
                      placeholder="$YourTag"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-of-gray uppercase tracking-widest mb-2 ml-1">Crypto Address</label>
                    <input
                      type="text"
                      value={paymentDetails.crypto}
                      onChange={(e) => setPaymentDetails({ ...paymentDetails, crypto: e.target.value })}
                      className="w-full border-2 border-of-light rounded-2xl p-4 focus:border-primary outline-none bg-of-light/30 font-bold transition-colors text-sm"
                      placeholder="BTC/ETH Address"
                    />
                  </div>
                  <button className="w-full bg-primary text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-primary-hover transition shadow-lg shadow-primary/30">Save Profile</button>
                </form>
              </section>

              <section className="bg-primary p-8 rounded-[2.5rem] shadow-xl shadow-primary/20 text-white">
                <h2 className="text-xl font-black mb-6 flex items-center gap-3 tracking-tight">
                  <Users /> Subscriber Stats
                </h2>
                <div className="space-y-4">
                  <div className="bg-white/10 p-6 rounded-3xl backdrop-blur-sm border border-white/10">
                    <span className="text-white/70 text-xs font-black uppercase tracking-widest">Total Active</span>
                    <p className="font-black text-5xl mt-1">{formatCompactNumber(subscriptions.filter((s) => s.status === 'active').length)}</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}

        {role === 'user' && (
          <div className="space-y-10">
            <section className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-xl border border-of-light">
              <h2 className="text-2xl md:text-3xl font-black text-of-dark mb-8 md:mb-10 flex items-center gap-4 tracking-tight">
                <CreditCard className="text-primary" size={32} /> My Subscriptions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {subscriptions.map((sub) => (
                  <div key={sub._id} className="p-8 border-2 border-of-light rounded-[2.5rem] bg-of-light/30 hover:bg-white hover:border-primary hover:shadow-xl transition-all duration-300 group">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="font-black text-of-dark text-xl tracking-tight">{sub.creatorId.name}</h3>
                        <p className="text-primary font-black text-sm italic">@{sub.creatorId.username}</p>
                      </div>
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        sub.status === 'active' ? 'bg-green-500 text-white' :
                        sub.status === 'pending' ? 'bg-orange-400 text-white' :
                        'bg-of-gray text-white'
                      }`}>
                        {sub.status}
                      </span>
                    </div>
                    <Link
                      href={`/${sub.creatorId.username}`}
                      className="w-full flex items-center justify-center gap-2 bg-white text-primary border border-primary px-4 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest group-hover:bg-primary group-hover:text-white transition-all shadow-sm"
                    >
                      <Eye size={16} /> View Profile
                    </Link>
                  </div>
                ))}
                {subscriptions.length === 0 && (
                  <div className="col-span-full py-20 border-4 border-dashed border-of-light rounded-[3rem] text-center">
                    <p className="text-of-gray font-black text-xl italic tracking-tight">You haven&apos;t joined any fan clubs yet.</p>
                    <Link href="/" className="inline-block mt-6 text-primary font-black hover:underline uppercase text-sm tracking-widest">Find Creators →</Link>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {role === 'admin' && (
          <div className="space-y-10">
            <section className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-xl border border-of-light overflow-hidden">
              <h2 className="text-2xl md:text-3xl font-black text-of-dark mb-8 md:mb-10 flex items-center gap-4 tracking-tight">
                <CreditCard className="text-primary" size={32} /> Subscription Ledger
              </h2>
              <div className="overflow-x-auto -mx-6 px-6">
                <table className="w-full text-left min-w-[600px]">
                  <thead>
                    <tr className="border-b-2 border-of-light">
                      <th className="pb-6 font-black text-of-gray uppercase text-[10px] tracking-widest">Subscriber</th>
                      <th className="pb-6 font-black text-of-gray uppercase text-[10px] tracking-widest">Creator</th>
                      <th className="pb-6 font-black text-of-gray uppercase text-[10px] tracking-widest">Ref/Proof</th>
                      <th className="pb-6 font-black text-of-gray uppercase text-[10px] tracking-widest text-center">Status</th>
                      <th className="pb-6 font-black text-of-gray uppercase text-[10px] tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-of-light/50">
                    {subscriptions.map((sub) => (
                      <tr key={sub._id} className="group hover:bg-of-light/20 transition-colors">
                        <td className="py-6 font-black text-of-dark tracking-tight">{sub.userId.name}</td>
                        <td className="py-6 text-of-gray font-bold tracking-tight">@{sub.creatorId.username}</td>
                        <td className="py-6 text-xs font-mono text-primary font-black uppercase">{sub.paymentProof}</td>
                        <td className="py-6 text-center">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            sub.status === 'active' ? 'bg-green-500/10 text-green-600' :
                            sub.status === 'pending' ? 'bg-orange-500/10 text-orange-600' :
                            'bg-red-500/10 text-red-600'
                          }`}>
                            {sub.status}
                          </span>
                        </td>
                        <td className="py-6 text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleApproveSubscription(sub._id, true)}
                              className="text-white bg-green-500 p-2 rounded-xl hover:bg-green-600 shadow-md transition"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button
                              onClick={() => handleApproveSubscription(sub._id, false)}
                              className="text-white bg-red-500 p-2 rounded-xl hover:bg-red-600 shadow-md transition"
                            >
                              <XCircle size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

             <section className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-xl border border-of-light overflow-hidden">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div className="flex flex-wrap items-center gap-6">
                  <h2 className="text-3xl font-black text-of-dark tracking-tight flex items-center gap-4">
                    <Users className="text-primary" size={32} /> Creator Hub
                  </h2>
                  <Link
                    href="/messages"
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-5 py-2.5 rounded-full hover:bg-primary hover:text-white transition-all shadow-sm"
                  >
                    <MessageSquare size={16} /> Global Messages
                  </Link>
                </div>
                <button
                  onClick={() => setShowCreateCreator(true)}
                  className="bg-primary text-white px-8 py-4 rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-primary-hover transition shadow-xl shadow-primary/30 flex items-center gap-3"
                >
                  <PlusSquare size={20} /> Add New Talent
                </button>
              </div>

              {showCreateCreator && (
                <div className="mb-12 p-10 bg-of-light rounded-[2.5rem] border-2 border-primary/20 shadow-inner">
                  <h3 className="text-xl font-black text-of-dark mb-8 tracking-tight uppercase">Talent Registration</h3>
                  <form onSubmit={handleCreateCreator} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-of-gray uppercase tracking-widest ml-1">Full Name</label>
                       <input
                         type="text"
                         placeholder="John Doe"
                         className="w-full p-4 border-2 border-white rounded-2xl focus:border-primary outline-none bg-white font-bold transition-all shadow-sm"
                         value={newCreator.name}
                         onChange={(e) => setNewCreator({ ...newCreator, name: e.target.value })}
                         required
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-of-gray uppercase tracking-widest ml-1">Email Address</label>
                       <input
                         type="email"
                         placeholder="jane@example.com"
                         className="w-full p-4 border-2 border-white rounded-2xl focus:border-primary outline-none bg-white font-bold transition-all shadow-sm"
                         value={newCreator.email}
                         onChange={(e) => setNewCreator({ ...newCreator, email: e.target.value })}
                         required
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-of-gray uppercase tracking-widest ml-1">Secure Password</label>
                       <input
                         type="password"
                         placeholder="••••••••"
                         className="w-full p-4 border-2 border-white rounded-2xl focus:border-primary outline-none bg-white font-bold transition-all shadow-sm"
                         value={newCreator.password}
                         onChange={(e) => setNewCreator({ ...newCreator, password: e.target.value })}
                         required
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-of-gray uppercase tracking-widest ml-1">Platform Username</label>
                       <input
                         type="text"
                         placeholder="unique_handle"
                         className="w-full p-4 border-2 border-white rounded-2xl focus:border-primary outline-none bg-white font-bold transition-all shadow-sm"
                         value={newCreator.username}
                         onChange={(e) => setNewCreator({ ...newCreator, username: e.target.value })}
                         required
                       />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                       <label className="text-[10px] font-black text-of-gray uppercase tracking-widest ml-1">Creator Bio</label>
                       <textarea
                         placeholder="A brief description of content style..."
                         className="w-full p-4 border-2 border-white rounded-2xl focus:border-primary outline-none bg-white font-bold transition-all shadow-sm min-h-[100px]"
                         value={newCreator.bio}
                         onChange={(e) => setNewCreator({ ...newCreator, bio: e.target.value })}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-of-gray uppercase tracking-widest ml-1">Initial Followers</label>
                       <input
                         type="number"
                         className="w-full p-4 border-2 border-white rounded-2xl focus:border-primary outline-none bg-white font-bold transition-all shadow-sm"
                         value={newCreator.displayFollowerCount}
                         onChange={(e) => setNewCreator({ ...newCreator, displayFollowerCount: parseInt(e.target.value) })}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-of-gray uppercase tracking-widest ml-1">Subscription Price ($)</label>
                       <input
                         type="number"
                         className="w-full p-4 border-2 border-white rounded-2xl focus:border-primary outline-none bg-white font-bold transition-all shadow-sm"
                         value={newCreator.subscriptionPrice}
                         onChange={(e) => setNewCreator({ ...newCreator, subscriptionPrice: parseFloat(e.target.value) })}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-of-gray uppercase tracking-widest ml-1">Profile Image</label>
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-white border border-of-light flex-shrink-0 relative">
                             {newCreator.profileImage ? <Image src={newCreator.profileImage} alt="New creator profile" fill className="object-cover" /> : <User className="w-full h-full p-2 text-of-gray" />}
                          </div>
                          <label className="bg-of-light text-primary px-3 py-1.5 rounded-lg font-black uppercase text-[9px] tracking-widest cursor-pointer border border-primary/10">
                             Upload
                             <input type="file" className="hidden" onChange={async (e) => {
                               const file = e.target.files?.[0];
                               if (!file) return;
                               const formData = new FormData();
                               formData.append('file', file);
                               const res = await fetch('/api/upload', { method: 'POST', body: formData });
                               const data = await res.json();
                               if (data.url) setNewCreator({ ...newCreator, profileImage: data.url });
                             }} accept="image/*" />
                          </label>
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-of-gray uppercase tracking-widest ml-1">Cover Image</label>
                       <div className="flex items-center gap-4">
                          <div className="w-20 h-12 rounded-lg overflow-hidden bg-white border border-of-light flex-shrink-0 relative">
                             {newCreator.coverImage ? <Image src={newCreator.coverImage} alt="New creator cover" fill className="object-cover" /> : <ImageIcon className="w-full h-full p-2 text-of-gray" />}
                          </div>
                          <label className="bg-of-light text-primary px-3 py-1.5 rounded-lg font-black uppercase text-[9px] tracking-widest cursor-pointer border border-primary/10">
                             Upload
                             <input type="file" className="hidden" onChange={async (e) => {
                               const file = e.target.files?.[0];
                               if (!file) return;
                               const formData = new FormData();
                               formData.append('file', file);
                               const res = await fetch('/api/upload', { method: 'POST', body: formData });
                               const data = await res.json();
                               if (data.url) setNewCreator({ ...newCreator, coverImage: data.url });
                             }} accept="image/*" />
                          </label>
                       </div>
                    </div>
                    <div className="md:col-span-2 flex gap-4 pt-4">
                      <button type="submit" className="bg-primary text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/30">Activate Account</button>
                      <button type="button" onClick={() => setShowCreateCreator(false)} className="bg-white text-of-gray px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest border border-of-light hover:bg-of-light transition">Cancel</button>
                    </div>
                  </form>
                </div>
              )}
              <div className="overflow-x-auto -mx-6 px-6">
                <table className="w-full text-left min-w-[600px]">
                  <thead>
                    <tr className="border-b-2 border-of-light">
                      <th className="pb-6 font-black text-of-gray uppercase text-[10px] tracking-widest">Talent Name</th>
                      <th className="pb-6 font-black text-of-gray uppercase text-[10px] tracking-widest">Handle</th>
                      <th className="pb-6 font-black text-of-gray uppercase text-[10px] tracking-widest text-center">Status</th>
                      <th className="pb-6 font-black text-of-gray uppercase text-[10px] tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-of-light/50">
                    {creators.map((creator) => (
                      <tr key={creator._id} className="group hover:bg-of-light/20 transition-colors">
                        <td className="py-6 font-black text-of-dark tracking-tight">{creator.name}</td>
                        <td className="py-6 text-primary font-black italic tracking-tight">@{creator.username}</td>
                        <td className="py-6 text-center">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${creator.isVerified ? 'bg-primary/10 text-primary' : 'bg-of-gray/10 text-of-gray'}`}>
                            {creator.isVerified ? 'VERIFIED' : 'PENDING'}
                          </span>
                        </td>
                        <td className="py-6 text-right">
                          <div className="flex gap-4 justify-end items-center">
                            <button
                              onClick={() => setEditingCreator(creator)}
                              className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline transition-colors"
                            >
                              Edit
                            </button>
                            <Link href={`/${creator.username}`} className="text-[10px] font-black uppercase tracking-widest text-of-gray hover:text-primary transition-colors">View Page</Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Edit Creator Modal */}
            {editingCreator && (
              <div className="fixed inset-0 bg-of-dark/80 backdrop-blur-md flex items-center justify-center z-[110] p-6">
                <div className="bg-white rounded-[2.5rem] p-10 max-w-2xl w-full shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
                   <button
                    onClick={() => setEditingCreator(null)}
                    className="absolute right-6 top-6 text-of-gray hover:text-of-dark transition"
                  >
                    <XCircle size={28} />
                  </button>
                  <h2 className="text-3xl font-black text-of-dark mb-8 tracking-tight">Edit Creator: {editingCreator.name}</h2>

                  <form onSubmit={handleAdminUpdateCreator} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-of-gray uppercase tracking-widest">Full Name</label>
                       <input
                         type="text"
                         className="w-full p-4 border-2 border-of-light rounded-2xl focus:border-primary outline-none bg-of-light/30 font-bold"
                         value={editingCreator.name}
                         onChange={(e) => setEditingCreator({ ...editingCreator, name: e.target.value })}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-of-gray uppercase tracking-widest">Subscription Price ($)</label>
                       <input
                         type="number"
                         step="0.01"
                         className="w-full p-4 border-2 border-of-light rounded-2xl focus:border-primary outline-none bg-of-light/30 font-bold"
                         value={editingCreator.subscriptionPrice}
                         onChange={(e) => setEditingCreator({ ...editingCreator, subscriptionPrice: parseFloat(e.target.value) })}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-of-gray uppercase tracking-widest">Display Follower Count</label>
                       <input
                         type="number"
                         className="w-full p-4 border-2 border-of-light rounded-2xl focus:border-primary outline-none bg-of-light/30 font-bold"
                         value={editingCreator.displayFollowerCount || 0}
                         onChange={(e) => setEditingCreator({ ...editingCreator, displayFollowerCount: parseInt(e.target.value) })}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-of-gray uppercase tracking-widest">Profile Image URL</label>
                       <input
                         type="text"
                         className="w-full p-4 border-2 border-of-light rounded-2xl focus:border-primary outline-none bg-of-light/30 font-bold"
                         value={editingCreator.profileImage}
                         onChange={(e) => setEditingCreator({ ...editingCreator, profileImage: e.target.value })}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-of-gray uppercase tracking-widest">Cover Image URL</label>
                       <input
                         type="text"
                         className="w-full p-4 border-2 border-of-light rounded-2xl focus:border-primary outline-none bg-of-light/30 font-bold"
                         value={editingCreator.coverImage}
                         onChange={(e) => setEditingCreator({ ...editingCreator, coverImage: e.target.value })}
                       />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                       <label className="text-[10px] font-black text-of-gray uppercase tracking-widest">Bio</label>
                       <textarea
                         className="w-full p-4 border-2 border-of-light rounded-2xl focus:border-primary outline-none bg-of-light/30 font-bold min-h-[100px]"
                         value={editingCreator.bio}
                         onChange={(e) => setEditingCreator({ ...editingCreator, bio: e.target.value })}
                       />
                    </div>
                    <div className="flex items-center gap-4">
                       <input
                        type="checkbox"
                        id="isVerified"
                        checked={editingCreator.isVerified}
                        onChange={(e) => setEditingCreator({ ...editingCreator, isVerified: e.target.checked })}
                        className="w-6 h-6 accent-primary"
                       />
                       <label htmlFor="isVerified" className="text-sm font-black text-of-dark uppercase tracking-widest">Verified Creator</label>
                    </div>
                    <div className="md:col-span-2 pt-6">
                      <button type="submit" className="w-full bg-primary text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/30 hover:bg-primary-hover transition">Save Changes</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
