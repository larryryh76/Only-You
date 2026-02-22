'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import {
  Users,
  CheckCircle,
  Clock,
  XCircle,
  CreditCard,
  PlusSquare,
  Eye,
  MessageSquare
} from 'lucide-react';

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
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [subscriptions, setSubscriptions] = useState<ISubscription[]>([]);
  const [creators, setCreators] = useState<ICreator[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [paymentDetails, setPaymentDetails] = useState({ cashapp: '', crypto: '' });
  const [showCreateCreator, setShowCreateCreator] = useState(false);
  const [newCreator, setNewCreator] = useState({
    name: '',
    email: '',
    password: '',
    username: '',
    bio: '',
    displayFollowerCount: 0,
  });

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

  const handleUpdatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/creators/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentDetails }),
    });
    if (res.ok) alert('Payment details updated!');
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newPostContent, isPremium: true }),
    });
    if (res.ok) {
      setNewPostContent('');
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
      setNewCreator({ name: '', email: '', password: '', username: '', bio: '', displayFollowerCount: 0 });
      fetchDashboardData();
      alert('Creator created successfully!');
    } else {
      const data = await res.json();
      alert(data.message);
    }
  };

  if (status === 'loading') return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto py-8 px-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 capitalize">{role} Dashboard</h1>

        {role === 'creator' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Create Post */}
              <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <PlusSquare className="text-blue-600" /> Create New Post
                </h2>
                <form onSubmit={handleCreatePost}>
                  <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-4 min-h-[120px] mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="What's on your mind?"
                  ></textarea>
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition">
                    Post to Subscribers
                  </button>
                </form>
              </section>

              {/* Subscription Approvals */}
              <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Clock className="text-orange-500" /> Pending Approvals
                </h2>
                <div className="space-y-4">
                  {subscriptions.filter((s) => s.status === 'pending').map((sub) => (
                    <div key={sub._id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-bold text-gray-900">{sub.userId.name}</p>
                        <p className="text-sm text-gray-500">{sub.paymentMethod}: {sub.paymentProof}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveSubscription(sub._id, true)}
                          className="bg-green-100 text-green-600 p-2 rounded-lg hover:bg-green-200 transition"
                        >
                          <CheckCircle size={20} />
                        </button>
                        <button
                          onClick={() => handleApproveSubscription(sub._id, false)}
                          className="bg-red-100 text-red-600 p-2 rounded-lg hover:bg-red-200 transition"
                        >
                          <XCircle size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {subscriptions.filter((s) => s.status === 'pending').length === 0 && (
                    <p className="text-gray-500 italic">No pending subscriptions.</p>
                  )}
                </div>
              </section>
            </div>

            <div className="space-y-8">
              <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <CreditCard className="text-blue-600" /> Payment Details
                </h2>
                <form onSubmit={handleUpdatePayment} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cash App Tag</label>
                    <input
                      type="text"
                      value={paymentDetails.cashapp}
                      onChange={(e) => setPaymentDetails({ ...paymentDetails, cashapp: e.target.value })}
                      className="w-full border rounded-lg p-2"
                      placeholder="$YourTag"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Crypto Address</label>
                    <input
                      type="text"
                      value={paymentDetails.crypto}
                      onChange={(e) => setPaymentDetails({ ...paymentDetails, crypto: e.target.value })}
                      className="w-full border rounded-lg p-2"
                      placeholder="BTC/ETH Address"
                    />
                  </div>
                  <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold">Update Details</button>
                </form>
              </section>

              <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Users className="text-blue-600" /> Stats
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Active Subscribers</span>
                    <span className="font-bold text-2xl">{subscriptions.filter((s) => s.status === 'active').length}</span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}

        {role === 'user' && (
          <div className="space-y-8">
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <CreditCard className="text-blue-600" /> My Subscriptions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subscriptions.map((sub) => (
                  <div key={sub._id} className="p-4 border border-gray-100 rounded-xl bg-gray-50">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-gray-900">{sub.creatorId.name}</h3>
                        <p className="text-sm text-gray-500">@{sub.creatorId.username}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${
                        sub.status === 'active' ? 'bg-green-100 text-green-600' :
                        sub.status === 'pending' ? 'bg-orange-100 text-orange-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {sub.status}
                      </span>
                    </div>
                    <Link
                      href={`/${sub.creatorId.username}`}
                      className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1"
                    >
                      <Eye size={16} /> View Profile
                    </Link>
                  </div>
                ))}
                {subscriptions.length === 0 && (
                  <p className="text-gray-500 italic">You are not subscribed to any creators yet.</p>
                )}
              </div>
            </section>
          </div>
        )}

        {role === 'admin' && (
          <div className="space-y-8">
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <CreditCard className="text-blue-600" /> All Subscriptions
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="py-4 font-bold text-gray-900">User</th>
                      <th className="py-4 font-bold text-gray-900">Creator</th>
                      <th className="py-4 font-bold text-gray-900">Proof</th>
                      <th className="py-4 font-bold text-gray-900">Status</th>
                      <th className="py-4 font-bold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions.map((sub) => (
                      <tr key={sub._id} className="border-b border-gray-50">
                        <td className="py-4 text-gray-800">{sub.userId.name}</td>
                        <td className="py-4 text-gray-500">{sub.creatorId.name}</td>
                        <td className="py-4 text-sm text-gray-500">{sub.paymentProof}</td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                            sub.status === 'active' ? 'bg-green-100 text-green-600' :
                            sub.status === 'pending' ? 'bg-orange-100 text-orange-600' :
                            'bg-red-100 text-red-600'
                          }`}>
                            {sub.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApproveSubscription(sub._id, true)}
                              className="text-green-600 hover:underline text-sm font-bold"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleApproveSubscription(sub._id, false)}
                              className="text-red-600 hover:underline text-sm font-bold"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

             <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <div className="flex gap-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Users className="text-blue-600" /> Manage Creators
                  </h2>
                  <Link
                    href="/messages"
                    className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-lg transition"
                  >
                    <MessageSquare size={16} /> View All Messages
                  </Link>
                </div>
                <button
                  onClick={() => setShowCreateCreator(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <PlusSquare size={20} /> Add Creator
                </button>
              </div>

              {showCreateCreator && (
                <div className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-200">
                  <h3 className="font-bold mb-4">Create New Creator</h3>
                  <form onSubmit={handleCreateCreator} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Name"
                      className="p-2 border rounded-lg"
                      value={newCreator.name}
                      onChange={(e) => setNewCreator({ ...newCreator, name: e.target.value })}
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      className="p-2 border rounded-lg"
                      value={newCreator.email}
                      onChange={(e) => setNewCreator({ ...newCreator, email: e.target.value })}
                      required
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      className="p-2 border rounded-lg"
                      value={newCreator.password}
                      onChange={(e) => setNewCreator({ ...newCreator, password: e.target.value })}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Username (for profile link)"
                      className="p-2 border rounded-lg"
                      value={newCreator.username}
                      onChange={(e) => setNewCreator({ ...newCreator, username: e.target.value })}
                      required
                    />
                    <textarea
                      placeholder="Bio"
                      className="p-2 border rounded-lg md:col-span-2"
                      value={newCreator.bio}
                      onChange={(e) => setNewCreator({ ...newCreator, bio: e.target.value })}
                    />
                    <input
                      type="number"
                      placeholder="Display Follower Count"
                      className="p-2 border rounded-lg"
                      value={newCreator.displayFollowerCount}
                      onChange={(e) => setNewCreator({ ...newCreator, displayFollowerCount: parseInt(e.target.value) })}
                    />
                    <div className="md:col-span-2 flex gap-2">
                      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold">Create</button>
                      <button type="button" onClick={() => setShowCreateCreator(false)} className="bg-gray-200 px-4 py-2 rounded-lg">Cancel</button>
                    </div>
                  </form>
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="py-4 font-bold text-gray-900">Name</th>
                      <th className="py-4 font-bold text-gray-900">Username</th>
                      <th className="py-4 font-bold text-gray-900">Status</th>
                      <th className="py-4 font-bold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {creators.map((creator) => (
                      <tr key={creator._id} className="border-b border-gray-50">
                        <td className="py-4 text-gray-800">{creator.name}</td>
                        <td className="py-4 text-gray-500">@{creator.username}</td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded-md text-xs font-bold ${creator.isVerified ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                            {creator.isVerified ? 'VERIFIED' : 'PENDING'}
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="flex gap-2">
                            <Link href={`/${creator.username}`} className="text-blue-600 hover:underline text-sm">View</Link>
                            <button className="text-red-600 hover:underline text-sm">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
