'use client';

import { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface Creator {
  _id: string;
  name: string;
  username: string;
  profileImage?: string;
  bio?: string;
  displayFollowerCount?: number;
}

export default function Home() {
  const { status } = useSession();
  const router = useRouter();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  useEffect(() => {
    fetch('/api/creators')
      .then((res) => res.json())
      .then((data) => setCreators(data));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError(res.error);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-12 px-6">
      <div className="w-full max-w-md flex flex-col items-center">
        <Image
          src="/logo.jpg"
          alt="OnlyFans"
          width={180}
          height={40}
          className="h-10 w-auto mb-8"
        />

        <h1 className="text-3xl font-bold text-of-dark mb-10 text-center">
          Sign up to support your favorite creators
        </h1>

        <form onSubmit={handleLogin} className="w-full space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-bold text-of-dark">Log in</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full border border-gray-300 rounded-md px-4 py-3 outline-none focus:border-primary"
              required
            />
          </div>
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full border border-gray-300 rounded-md px-4 py-3 outline-none focus:border-primary"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm font-bold">{error}</p>}

          <button
            type="submit"
            className="w-full bg-primary text-white py-3 rounded-full font-bold uppercase tracking-wide hover:bg-primary-hover transition mt-2"
          >
            LOG IN
          </button>
        </form>

        <div className="flex justify-between w-full mt-6 text-sm">
          <Link href="#" className="text-primary hover:underline">Forgot password?</Link>
          <Link href="/register" className="text-primary hover:underline">Sign up for OnlyFans</Link>
        </div>

        <div className="mt-12 w-full space-y-3">
          <button className="w-full flex items-center justify-center gap-3 border border-gray-300 py-3 rounded-full font-bold text-sm uppercase">
            <span className="text-blue-400 font-bold">X</span> Sign in with X
          </button>
          <button className="w-full flex items-center justify-center gap-3 border border-gray-300 py-3 rounded-full font-bold text-sm uppercase">
            <span className="text-red-500 font-bold">G</span> Sign in with Google
          </button>
        </div>

        {creators.length > 0 && (
          <div className="mt-16 w-full">
            <p className="text-center text-xs font-bold text-of-gray uppercase tracking-widest mb-6">Featured Creators</p>
            <div className="flex justify-center -space-x-4">
              {creators.slice(0, 6).map((creator) => (
                <div key={creator._id} className="w-12 h-12 rounded-full border-2 border-white bg-of-light overflow-hidden shadow-sm">
                  {creator.profileImage ? (
                    <Image src={creator.profileImage} alt="" width={48} height={48} className="object-cover h-full w-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary text-white font-bold text-xs">{creator.name[0]}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
