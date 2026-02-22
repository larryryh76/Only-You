'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
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
  const [creators, setCreators] = useState<Creator[]>([]);

  useEffect(() => {
    fetch('/api/creators')
      .then((res) => res.json())
      .then((data) => setCreators(data));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto py-12 px-6">
        <header className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
            Connect with your <span className="text-blue-600">Favorite Creators</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Subscribe to access exclusive content and message your favorite creators directly.
          </p>
        </header>

        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-8">Featured Creators</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {creators.map((creator: any) => (
              <Link
                key={creator._id}
                href={`/${creator.username}`}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition"
              >
                <div className="h-32 bg-blue-100"></div>
                <div className="p-6 -mt-12">
                  <div className="w-20 h-20 bg-gray-200 border-4 border-white rounded-full overflow-hidden mb-4">
                    {creator.profileImage ? (
                      <Image
                        src={creator.profileImage}
                        alt={creator.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600 text-2xl font-bold">
                        {creator.name[0]}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mb-1">
                    <h3 className="text-xl font-bold text-gray-900">{creator.name}</h3>
                    <CheckCircle className="text-blue-500 fill-current" size={18} />
                  </div>
                  <p className="text-gray-500 mb-4">@{creator.username}</p>
                  <p className="text-gray-600 line-clamp-2 mb-4">{creator.bio || 'No bio available.'}</p>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-gray-800">{creator.displayFollowerCount || 0} Followers</span>
                    <span className="text-blue-600 font-medium">View Profile →</span>
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
