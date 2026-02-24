'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-of-light flex flex-col items-center justify-center px-6 py-12 md:py-24">
      <div className="w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl border border-of-light overflow-hidden flex flex-col md:flex-row">
        {/* Left Side: Visual/Branding */}
        <div className="w-full md:w-1/2 bg-primary p-12 flex flex-col justify-center items-center text-white text-center">
           <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-8 shadow-inner">
              <span className="text-6xl font-black tracking-tighter">O</span>
           </div>
           <h1 className="text-5xl font-black mb-6 tracking-tighter leading-none uppercase">
             Only<br />You
           </h1>
           <p className="text-lg font-medium opacity-90 leading-relaxed max-w-xs">
             Join the world&apos;s premier platform for exclusive content.
           </p>

           <div className="mt-12 w-full space-y-4">
              <div className="bg-white/10 p-4 rounded-2xl flex items-center gap-4 text-left backdrop-blur-sm border border-white/10">
                 <CheckCircle size={24} className="text-white shrink-0" />
                 <p className="text-sm font-bold">Secure Manual Payments</p>
              </div>
              <div className="bg-white/10 p-4 rounded-2xl flex items-center gap-4 text-left backdrop-blur-sm border border-white/10">
                 <CheckCircle size={24} className="text-white shrink-0" />
                 <p className="text-sm font-bold">Direct Message Creators</p>
              </div>
           </div>
        </div>

        {/* Right Side: Auth Options */}
        <div className="w-full md:w-1/2 p-12 flex flex-col justify-center bg-white">
           <div className="mb-10 text-center md:text-left">
              <h2 className="text-3xl font-black text-of-dark mb-2 tracking-tight">Get Started</h2>
              <p className="text-of-gray font-medium">Log in or create a new account to continue.</p>
           </div>

           <div className="space-y-4">
              <Link
                href="/login"
                className="w-full flex items-center justify-center gap-3 bg-primary text-white py-5 rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-primary-hover transition shadow-xl shadow-primary/20"
              >
                Sign In to OnlyYou
              </Link>
              <Link
                href="/register"
                className="w-full flex items-center justify-center gap-3 bg-white text-primary border-2 border-primary py-5 rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-of-light transition"
              >
                Create Account
              </Link>
           </div>

           <div className="mt-12 space-y-8">
              <div className="flex items-center gap-4">
                 <div className="h-[1px] flex-1 bg-of-light"></div>
                 <span className="text-[10px] font-black text-of-gray uppercase tracking-widest">Featured Creators</span>
                 <div className="h-[1px] flex-1 bg-of-light"></div>
              </div>

              <div className="flex justify-center -space-x-4">
                 {creators.slice(0, 5).map((creator) => (
                    <div key={creator._id} className="w-12 h-12 rounded-full border-4 border-white bg-of-light overflow-hidden shadow-md">
                       {creator.profileImage ? (
                         <Image src={creator.profileImage} alt="" width={48} height={48} className="object-cover h-full w-full" />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center bg-primary text-white font-black text-xs">{creator.name[0]}</div>
                       )}
                    </div>
                 ))}
              </div>
              <p className="text-center text-xs text-of-gray font-medium">
                Join <span className="text-of-dark font-black">1.5M+</span> fans supporting their favorite creators.
              </p>
           </div>
        </div>
      </div>

      {/* Mobile-Friendly footer */}
      <footer className="mt-8 text-of-gray text-[10px] font-black uppercase tracking-widest flex gap-6">
         <Link href="#" className="hover:text-primary transition">Terms</Link>
         <Link href="#" className="hover:text-primary transition">Privacy</Link>
         <Link href="#" className="hover:text-primary transition">Help</Link>
      </footer>
    </div>
  );
}
