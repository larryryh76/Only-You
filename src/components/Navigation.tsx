'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  Home,
  MessageSquare,
  LayoutDashboard,
  User,
  LogOut,
  Bell,
  PlusSquare
} from 'lucide-react';
import Logo from './ui/Logo';

export default function Navigation() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  // Don't show navigation on auth pages or landing page (if unauthenticated)
  if (pathname === '/login' || pathname === '/register') return null;
  if (pathname === '/' && status !== 'authenticated') return null;

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Messages', href: '/messages', icon: MessageSquare },
  ];

  if (session) {
    navItems.push({ label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard });
  }

  if (session?.user?.role === 'creator') {
    navItems.push({ label: 'Profile', href: `/${session.user.username}`, icon: User });
  }

  const NavItem = ({ item }: { item: typeof navItems[0] }) => {
    const isActive = pathname === item.href;
    return (
      <Link
        href={item.href}
        className={`flex items-center gap-4 px-4 py-3 rounded-full transition-all duration-200 group ${
          isActive
            ? 'text-primary bg-primary/10 font-bold'
            : 'text-of-dark hover:bg-of-light font-medium'
        }`}
      >
        <item.icon size={26} className={isActive ? 'text-primary' : 'text-of-gray group-hover:text-of-dark'} />
        <span className="text-lg hidden xl:inline">{item.label}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-20 xl:w-64 border-r border-of-light bg-white z-50 px-4 py-6">
        <div className="mb-10 px-2 flex justify-center xl:justify-start">
          <Logo showText={false} className="xl:hidden" />
          <Logo className="hidden xl:flex" />
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <NavItem key={item.href} item={item} />
          ))}
        </nav>

        {session && (
          <div className="mt-auto space-y-4 pt-6 border-t border-of-light">
             <div className="px-2 flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-black text-sm uppercase">
                  {session.user?.name?.[0]}
                </div>
                <div className="hidden xl:block overflow-hidden">
                   <p className="font-bold text-of-dark truncate text-sm">{session.user?.name}</p>
                   <p className="text-of-gray text-xs truncate">@{session.user?.email?.split('@')[0]}</p>
                </div>
             </div>
             <button
              onClick={() => signOut()}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-full text-of-gray hover:text-red-500 hover:bg-red-50 transition-all font-medium"
            >
              <LogOut size={26} />
              <span className="text-lg hidden xl:inline">Logout</span>
            </button>
          </div>
        )}

        {!session && (
          <div className="mt-auto space-y-4 pt-6 border-t border-of-light">
             <Link
              href="/login"
              className="w-full flex items-center gap-4 px-4 py-3 rounded-full bg-primary text-white font-black uppercase text-xs tracking-widest hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 justify-center"
             >
                <span className="hidden xl:inline">Login / Sign Up</span>
                <span className="xl:hidden">Login</span>
             </Link>
          </div>
        )}
      </aside>

  {/* Mobile Bottom Navigation */}
  <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-50">
    <Link href="/" className={pathname === '/' ? 'text-of-dark' : 'text-of-gray'}>
      <Home size={28} strokeWidth={isActive('/') ? 2.5 : 2} />
    </Link>
    <Link href="/notifications" className={pathname === '/notifications' ? 'text-of-dark' : 'text-of-gray'}>
      <Bell size={28} strokeWidth={isActive('/notifications') ? 2.5 : 2} />
    </Link>
    <Link href="/dashboard" className={pathname === '/dashboard' ? 'text-of-dark' : 'text-of-gray'}>
      <PlusSquare size={28} strokeWidth={isActive('/dashboard') ? 2.5 : 2} />
    </Link>
    <Link href="/messages" className={pathname === '/messages' ? 'text-of-dark' : 'text-of-gray'}>
      <MessageSquare size={28} strokeWidth={isActive('/messages') ? 2.5 : 2} />
    </Link>
        {session ? (
      <Link href={`/${session.user.username || 'settings'}`} className={pathname.startsWith('/settings') || (session.user.username && pathname === `/${session.user.username}`) ? 'text-of-dark' : 'text-of-gray'}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold overflow-hidden border-2 ${(pathname.startsWith('/settings') || (session.user.username && pathname === `/${session.user.username}`)) ? 'border-of-dark bg-of-dark text-white' : 'border-gray-300 bg-gray-200'}`}>
           {session.user.name?.[0] || 'U'}
        </div>
      </Link>
        ) : (
          <Link href="/login" className="text-of-gray">
            <User size={28} />
          </Link>
        )}
      </nav>
    </>
  );
}
