'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import FeaturedPosts from '@/components/FeaturedPosts';

export default function Login() {
  return (
    <Suspense fallback={<div className="text-center py-20">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
        setIsLoading(false);
      } else {
        router.push(callbackUrl);
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
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

        <h1 className="text-3xl font-bold text-of-dark mb-10 text-center uppercase tracking-tight">
          Log In
        </h1>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
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
          <div className="space-y-1">
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

        <div className="flex justify-between w-full mt-6 text-sm mb-16">
          <Link href="#" className="text-primary hover:underline">Forgot password?</Link>
          <Link href="/register" className="text-primary hover:underline">Sign up for OnlyFans</Link>
        </div>
      </div>

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
