'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle } from 'lucide-react';
import { formatCompactNumber } from '@/lib/formatters';

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
    <div className="min-h-screen">
      <main className="max-w-6xl mx-auto py-12 px-6">
        <header className="text-center mb-16 py-10">
          <h1 className="text-6xl font-black text-of-dark mb-6 tracking-tighter">
            Unlock your <span className="text-primary italic">Exclusive</span> World
          </h1>
          <p className="text-xl text-of-gray max-w-2xl mx-auto font-medium">
            The platform where creators and fans connect on a deeper level.
          </p>
          <div className="mt-10">
            <Link
              href="/register"
              className="bg-primary text-white px-10 py-4 rounded-full font-black text-lg uppercase tracking-widest hover:bg-primary-hover transition shadow-xl shadow-primary/20"
            >
              Get Started Now
            </Link>
          </div>
        </header>

        <section>
          <div className="flex justify-between items-end mb-10">
            <h2 className="text-3xl font-black text-of-dark tracking-tight">Featured Creators</h2>
            <Link href="/register" className="text-primary font-bold hover:underline">See all →</Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {creators.map((creator) => (
              <Link
                key={creator._id}
                href={`/${creator.username}`}
                className="group bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="h-40 bg-gradient-to-br from-primary/20 to-primary/40 relative">
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                </div>
                <div className="p-8 -mt-16 relative">
                  <div className="w-24 h-24 bg-gray-200 border-4 border-white rounded-full overflow-hidden mb-4 shadow-lg">
                    {creator.profileImage ? (
                      <Image
                        src={creator.profileImage}
                        alt={creator.name}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-of-gray text-white text-3xl font-black">
                        {creator.name[0]}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <h3 className="text-2xl font-black text-of-dark">{creator.name}</h3>
                    <CheckCircle className="text-primary fill-current" size={20} />
                  </div>
                  <p className="text-of-gray font-bold mb-6 italic">@{creator.username}</p>
                  <p className="text-of-dark/70 line-clamp-2 mb-6 text-sm leading-relaxed">
                    {creator.bio || 'Experience exclusive content and direct interactions with me on OnlyYou.'}
                  </p>
                  <div className="flex justify-between items-center border-t border-of-light pt-6">
                    <div className="flex flex-col">
                      <span className="font-black text-of-dark text-lg">{formatCompactNumber(creator.displayFollowerCount || 0)}</span>
                      <span className="text-[10px] uppercase tracking-widest text-of-gray font-bold">Followers</span>
                    </div>
                    <span className="bg-of-light text-primary px-4 py-2 rounded-full font-black text-xs uppercase tracking-wider group-hover:bg-primary group-hover:text-white transition-colors">
                      View Profile
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
