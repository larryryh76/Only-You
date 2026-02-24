'use client';

import { usePathname } from 'next/navigation';
import Navigation from '@/components/Navigation';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register';

  return (
    <div className="flex">
      {!isAuthPage && <Navigation />}
      <main className={`flex-1 ${isAuthPage ? '' : 'md:ml-20 xl:ml-64 pb-20 md:pb-0'} min-h-screen`}>
        {children}
      </main>
    </div>
  );
}
