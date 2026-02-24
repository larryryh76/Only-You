'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { X } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    if (res.ok) {
      router.push('/login');
    } else {
      const data = await res.json();
      setError(data.message);
    }
  };

  return (
    <div className="min-h-screen bg-of-light flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center py-20 px-6">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-of-light w-full max-w-md relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>

          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-of-dark tracking-tight uppercase mb-2">Join the Club</h1>
            <p className="text-of-gray font-bold text-sm tracking-widest uppercase">Create your fan account</p>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-100 text-red-600 p-4 rounded-2xl mb-8 text-center font-bold text-sm flex items-center justify-center gap-2">
              <X size={18} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-[10px] font-black text-of-gray uppercase tracking-widest ml-1">Full Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border-2 border-of-light rounded-2xl px-6 py-4 outline-none focus:border-primary bg-of-light/30 font-bold transition-all"
                placeholder="John Doe"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-[10px] font-black text-of-gray uppercase tracking-widest ml-1">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-2 border-of-light rounded-2xl px-6 py-4 outline-none focus:border-primary bg-of-light/30 font-bold transition-all"
                placeholder="jane@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-[10px] font-black text-of-gray uppercase tracking-widest ml-1">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-2 border-of-light rounded-2xl px-6 py-4 outline-none focus:border-primary bg-of-light/30 font-bold transition-all"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-white py-5 rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-primary-hover transition shadow-xl shadow-primary/30 mt-4"
            >
              Get Started
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-of-light text-center">
            <p className="text-of-gray font-bold text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
