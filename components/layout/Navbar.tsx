import Image from "next/image";
import Link from "next/link";

export function Navbar() {
  return (
    <header className="w-full bg-surface border-b border-border">
      <div className="max-w-[1440px] mx-auto h-16 flex items-center justify-between px-6">
        <Link href="/">
          <Image src="/logo.png" alt="JobPilot" width={120} height={30} className="h-7 w-auto" />
        </Link>

        <nav className="flex items-center gap-8">
          <Link href="/dashboard" className="text-sm font-medium text-text-dark hover:text-accent transition-colors">
            Dashboard
          </Link>
          <Link href="/find-jobs" className="text-sm font-medium text-text-dark hover:text-accent transition-colors">
            Find Jobs
          </Link>
          <Link href="/profile" className="text-sm font-medium text-text-dark hover:text-accent transition-colors">
            Profile
          </Link>
        </nav>

        <Link
          href="/login"
          className="bg-overlay-dark text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
        >
          Start for free
        </Link>
      </div>
    </header>
  );
}
