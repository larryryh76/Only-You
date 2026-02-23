import { Lock } from 'lucide-react';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export default function Logo({ className = '', showText = true }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center gap-1.5 hover:opacity-90 transition ${className}`}>
      <div className="relative flex items-center justify-center">
        <span className="text-3xl font-black text-primary tracking-tighter">O</span>
        <div className="absolute inset-0 flex items-center justify-center pt-1">
          <Lock size={14} className="text-primary fill-current" />
        </div>
      </div>
      {showText && (
        <span className="text-2xl font-bold text-of-dark tracking-tight">
          Only<span className="text-primary">You</span>
        </span>
      )}
    </Link>
  );
}
