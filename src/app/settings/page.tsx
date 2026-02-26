'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  ArrowLeft,
  Camera,
  MapPin,
  Link as LinkIcon,
  Share2,
  Check,
  Copy,
  ChevronRight,
  User,
  Shield,
  Bell,
  Pencil
} from 'lucide-react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';

export default function Settings() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [profile, setProfile] = useState({
    name: '',
    username: '',
    bio: '',
    location: '',
    website: '',
    profileImage: '',
    coverImage: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('Profile');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user) {
      // Fetch user profile from API
      fetch('/api/creators/me')
        .then(res => res.json())
        .then(data => {
          setProfile({
            name: data.name || '',
            username: data.username || '',
            bio: data.bio || '',
            location: data.location || '',
            website: data.website || '',
            profileImage: data.profileImage || '',
            coverImage: data.coverImage || ''
          });
        });
    }
  }, [status, session, router]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'profileImage' | 'coverImage') => {
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
        setProfile({ ...profile, [field]: data.url });
      }
    } catch (err) {
      console.error('Upload failed', err);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/creators/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        alert('Profile updated successfully!');
      }
    } catch (err) {
      console.error('Save failed', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/${profile.username}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (status === 'loading') return null;

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 sticky top-0 bg-white z-[100]">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 -ml-2 text-of-dark">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-of-dark uppercase tracking-tight">Edit Profile</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="text-primary font-bold uppercase tracking-widest text-sm disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 px-4 overflow-x-auto no-scrollbar">
        {['Profile', 'Privacy and safety', 'Notifications'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-4 px-4 text-xs font-black uppercase tracking-widest whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-of-gray'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="animate-in fade-in duration-500">
        {/* Cover & Profile Images */}
        <div className="relative">
          <div className="h-40 bg-gray-100 relative group overflow-hidden">
            {profile.coverImage ? (
              <Image src={profile.coverImage} alt="Cover" fill className="object-cover" />
            ) : (
              <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                <Camera className="text-primary/20" size={32} />
              </div>
            )}
            <label className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <div className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30">
                <Camera className="text-white" size={24} />
              </div>
              <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'coverImage')} accept="image/*" />
            </label>
          </div>

          <div className="px-4 -mt-10 relative z-10 flex justify-between items-end">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full border-4 border-white bg-white overflow-hidden relative shadow-lg">
                {profile.profileImage ? (
                  <Image src={profile.profileImage} alt="Profile" fill className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                    <User className="text-primary/30" size={32} />
                  </div>
                )}
                <label className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="text-white" size={20} />
                  <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'profileImage')} accept="image/*" />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Banner Link */}
        <div className="px-4 mt-6">
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-2 rounded-xl text-white">
                <Share2 size={18} />
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest">Share your profile link</p>
                <p className="text-xs text-of-gray font-bold truncate">onlyfans.com/{profile.username || 'username'}</p>
              </div>
            </div>
            <button
              onClick={handleCopyLink}
              className="bg-white p-2.5 rounded-xl border border-primary/20 text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>
        </div>

        {/* Fields */}
        <div className="px-4 mt-8 space-y-8">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-of-gray uppercase tracking-widest ml-1">Display Name</label>
            <div className="relative">
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({...profile, name: e.target.value})}
                className="w-full border-b border-gray-200 py-3 font-bold text-of-dark outline-none focus:border-primary transition-colors pr-8"
                placeholder="Your Name"
              />
              <Pencil size={14} className="absolute right-0 top-1/2 -translate-y-1/2 text-of-gray/40" />
            </div>
          </div>

          <div className="space-y-1 opacity-50 cursor-not-allowed">
            <label className="text-[10px] font-black text-of-gray uppercase tracking-widest ml-1">Username (Not changeable)</label>
            <div className="flex items-center gap-1 border-b border-gray-200 py-3 font-bold text-of-dark">
              <span className="text-of-gray">@</span>
              <input
                type="text"
                value={profile.username}
                readOnly
                className="w-full outline-none bg-transparent"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-of-gray uppercase tracking-widest ml-1">Bio</label>
            <div className="relative">
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({...profile, bio: e.target.value})}
                className="w-full border-b border-gray-200 py-3 font-bold text-of-dark outline-none focus:border-primary transition-colors pr-8 min-h-[60px]"
                placeholder="Tell your fans about yourself..."
              />
              <Pencil size={14} className="absolute right-0 top-4 text-of-gray/40" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-of-gray uppercase tracking-widest ml-1">Location</label>
            <div className="relative flex items-center">
              <MapPin size={18} className="text-of-gray mr-3" />
              <input
                type="text"
                value={profile.location}
                onChange={(e) => setProfile({...profile, location: e.target.value})}
                className="w-full border-b border-gray-200 py-3 font-bold text-of-dark outline-none focus:border-primary transition-colors pr-8"
                placeholder="Add location"
              />
              <Pencil size={14} className="absolute right-0 top-1/2 -translate-y-1/2 text-of-gray/40" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-of-gray uppercase tracking-widest ml-1">Website URL</label>
            <div className="relative flex items-center">
              <LinkIcon size={18} className="text-of-gray mr-3" />
              <input
                type="text"
                value={profile.website}
                onChange={(e) => setProfile({...profile, website: e.target.value})}
                className="w-full border-b border-gray-200 py-3 font-bold text-of-dark outline-none focus:border-primary transition-colors pr-8"
                placeholder="Add website"
              />
              <Pencil size={14} className="absolute right-0 top-1/2 -translate-y-1/2 text-of-gray/40" />
            </div>
          </div>
        </div>

        {/* Footer Options */}
        <div className="px-4 mt-12 mb-20 space-y-1">
          <Link href="/privacy" className="flex items-center justify-between py-4 border-b border-gray-100 group">
            <div className="flex items-center gap-4">
              <Shield className="text-of-gray group-hover:text-primary transition-colors" size={20} />
              <span className="text-sm font-bold text-of-dark">Privacy and Safety</span>
            </div>
            <ChevronRight className="text-of-gray" size={20} />
          </Link>
          <Link href="/notifications" className="flex items-center justify-between py-4 border-b border-gray-100 group">
            <div className="flex items-center gap-4">
              <Bell className="text-of-gray group-hover:text-primary transition-colors" size={20} />
              <span className="text-sm font-bold text-of-dark">Notifications</span>
            </div>
            <ChevronRight className="text-of-gray" size={20} />
          </Link>
        </div>
      </div>

      <Navigation />
    </div>
  );
}
