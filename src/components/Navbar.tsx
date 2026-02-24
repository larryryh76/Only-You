'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { User, LogOut, LayoutDashboard, MessageSquare } from 'lucide-react';
import Logo from './ui/Logo';

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-white border-b border-gray-200 py-4 px-6 flex justify-between items-center sticky top-0 z-50">
      <Link href="/" className="text-2xl font-bold text-blue-600">
        OnlyFans
      </Link>
      <div className="flex items-center gap-6">
        {session ? (
          <>
            <Link href="/messages" className="text-of-gray hover:text-primary transition flex items-center gap-2">
              <MessageSquare size={22} />
              <span className="hidden md:inline font-semibold">Messages</span>
            </Link>
            <Link href="/dashboard" className="text-of-gray hover:text-primary transition flex items-center gap-2">
              <LayoutDashboard size={22} />
              <span className="hidden md:inline font-semibold">Dashboard</span>
            </Link>
            <div className="flex items-center gap-2 text-of-dark font-bold bg-of-light px-3 py-1.5 rounded-full border border-gray-100">
              <User size={18} className="text-primary" />
              <span className="text-sm">{session.user?.name}</span>
            </div>
            <button
              onClick={() => signOut()}
              className="text-of-gray hover:text-red-500 transition flex items-center gap-2"
            >
              <LogOut size={22} />
              <span className="hidden md:inline font-semibold">Logout</span>
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="text-of-gray hover:text-primary font-bold uppercase text-xs tracking-wider">
              Login
            </Link>
            <Link
              href="/register"
              className="bg-primary text-white px-6 py-2 rounded-full font-bold uppercase text-xs tracking-wider hover:bg-primary-hover transition shadow-sm"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
