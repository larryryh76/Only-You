'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { User, LogOut, LayoutDashboard, MessageSquare } from 'lucide-react';

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
            <Link href="/messages" className="text-gray-600 hover:text-blue-600 flex items-center gap-2">
              <MessageSquare size={20} />
              <span className="hidden md:inline">Messages</span>
            </Link>
            <Link href="/dashboard" className="text-gray-600 hover:text-blue-600 flex items-center gap-2">
              <LayoutDashboard size={20} />
              <span className="hidden md:inline">Dashboard</span>
            </Link>
            <div className="flex items-center gap-2 text-gray-800 font-medium">
              <User size={20} />
              <span>{session.user?.name}</span>
            </div>
            <button
              onClick={() => signOut()}
              className="text-gray-600 hover:text-red-600 flex items-center gap-2"
            >
              <LogOut size={20} />
              <span className="hidden md:inline">Logout</span>
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="text-gray-600 hover:text-blue-600 font-medium">
              Login
            </Link>
            <Link
              href="/register"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
