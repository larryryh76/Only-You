'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

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
        router.push('/dashboard');
      }
    } catch (_err) {
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

        <div className="flex justify-between w-full mt-6 text-sm">
          <Link href="#" className="text-primary hover:underline">Forgot password?</Link>
          <Link href="/register" className="text-primary hover:underline">Sign up for OnlyFans</Link>
        </div>
      </div>
    </div>
  );
}
