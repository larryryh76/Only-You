'use client';

import { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import FeaturedPosts from '@/components/FeaturedPosts';

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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  useEffect(() => {
    fetch('/api/creators')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCreators(data);
        }
      })
      .catch(err => console.error("Error fetching creators:", err));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError(res.error);
      setIsLoading(false);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center">
      {/* Hero Section */}
      <div className="w-full max-w-md flex flex-col items-center pt-12 px-6 pb-16">
        <Image
          src="/logo.jpg"
          alt="OnlyFans"
          width={180}
          height={40}
          className="h-10 w-auto mb-8"
        />

        <h1 className="text-3xl font-bold text-of-dark mb-10 text-center uppercase tracking-tight">
          Sign up to support your favorite creators
        </h1>

        <form onSubmit={handleLogin} className="w-full space-y-4">
          <div className="space-y-1">
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
            disabled={isLoading}
            className="w-full bg-primary text-white py-3 rounded-full font-bold uppercase tracking-wide hover:bg-primary-hover transition mt-2 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                LOGGING IN...
              </>
            ) : (
              'LOG IN'
            )}
          </button>
        </form>

        <div className="flex justify-between w-full mt-6 text-sm">
          <Link href="#" className="text-primary hover:underline">Forgot password?</Link>
          <Link href="/register" className="text-primary hover:underline font-bold">Sign up for OnlyFans</Link>
        </div>

        <div className="mt-12 w-full space-y-3">
          <button className="w-full flex items-center justify-center gap-3 border border-gray-300 py-3 rounded-full font-bold text-sm uppercase hover:bg-gray-50 transition">
            <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
            Sign in with X
          </button>
          <button className="w-full flex items-center justify-center gap-3 border border-gray-300 py-3 rounded-full font-bold text-sm uppercase hover:bg-gray-50 transition">
            <svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path><path fill="none" d="M0 0h48v48H0z"></path></svg>
            Sign in with Google
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
                    <div className="w-full h-full flex items-center justify-center bg-primary text-white font-bold text-xs uppercase">{creator.name[0]}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Blog Section */}
      <FeaturedPosts />

      {/* Footer */}
      <footer className="w-full border-t border-gray-100 py-10 px-6 bg-white">
        <div className="max-w-md mx-auto flex flex-wrap justify-center gap-x-6 gap-y-3 text-[13px] text-of-gray font-medium">
          <Link href="#" className="hover:text-primary">About</Link>
          <Link href="#" className="hover:text-primary">Contact</Link>
          <Link href="#" className="hover:text-primary">Help</Link>
          <Link href="#" className="hover:text-primary">Terms of Service</Link>
          <Link href="#" className="hover:text-primary">Privacy Policy</Link>
          <Link href="#" className="hover:text-primary">Complaints Policy</Link>
          <Link href="#" className="hover:text-primary">Cookies</Link>
          <Link href="#" className="hover:text-primary">Branding</Link>
          <Link href="#" className="hover:text-primary">Store</Link>
        </div>
        <div className="mt-8 text-center text-[11px] text-of-gray/60 uppercase tracking-widest font-bold">
          © {new Date().getFullYear()} OnlyFans
        </div>
      </footer>
    </div>
  );
}
