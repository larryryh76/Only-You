import Image from 'next/image';
import { CheckCircle2 } from 'lucide-react';

const BLOG_POSTS = [
  {
    id: 1,
    author: 'OnlyFans',
    handle: 'onlyfans',
    date: 'Yesterday',
    title: 'Cyprus living, inside and out.',
    excerpt: "@roxxyharris gives a tour of her new home, sharing personal touches and the upgrades she's ex-",
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 2,
    author: 'OnlyFans',
    handle: 'onlyfans',
    date: 'Yesterday',
    title: 'Hidden gems in Malibu.',
    excerpt: '@karlyetaylor2 and @itsnatdogx2 discover a hidden Basque-style market in Malibu, then wander through a charming little com-',
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=800',
  }
];

export default function FeaturedPosts() {
  return (
    <div className="w-full bg-of-light/30 border-t border-gray-100 pt-16 pb-20 px-6">
      <div className="max-w-md mx-auto">
        <h2 className="text-lg font-bold text-of-dark mb-8">Latest featured posts</h2>

        <div className="space-y-8">
          {BLOG_POSTS.map((post) => (
            <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                    <Image src="/logo.jpg" alt="OnlyFans" width={40} height={40} className="w-6 h-auto invert" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-sm">{post.author}</span>
                      <CheckCircle2 size={14} className="text-primary fill-primary text-white" />
                    </div>
                    <span className="text-xs text-of-gray">@{post.handle}</span>
                  </div>
                </div>
                <span className="text-xs text-of-gray">{post.date}</span>
              </div>

              <div className="px-4 pb-2">
                <p className="text-sm text-of-dark font-medium leading-tight">
                  <span className="font-bold">{post.title}</span> {post.excerpt}
                </p>
                <button className="text-primary text-sm font-bold mt-2 hover:underline">Read more</button>
              </div>

              <div className="aspect-video w-full relative">
                <Image src={post.image} alt={post.title} fill className="object-cover" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
