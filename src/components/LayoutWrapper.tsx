'use client';

import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navigation from '@/components/Navigation';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { status } = useSession();

  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isLandingPage = pathname === '/';
  const showNavigation = !isAuthPage && !(isLandingPage && status !== 'authenticated');

  return (
    <div className="flex justify-center min-h-screen">
      {showNavigation && <Navigation />}
      <main className={`flex-1 w-full ${
        !showNavigation
          ? ''
          : 'max-w-full md:max-w-[700px] md:ml-20 xl:ml-0 xl:mx-auto pb-20 md:pb-0 border-x border-gray-100 bg-white shadow-sm'
      } min-h-screen`}>
        {children}
      </main>
    </div>
  );
}
