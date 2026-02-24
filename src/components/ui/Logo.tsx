import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export default function Logo({ className = '', showText = true }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center gap-2 hover:opacity-90 transition ${className}`}>
      <Image
        src="/logo.jpg"
        alt="OnlyFans"
        width={40}
        height={40}
        className="rounded-full"
      />
      {showText && (
        <span className="text-2xl font-bold text-of-dark tracking-tight">
          OnlyFans
        </span>
      )}
    </Link>
  );
}
