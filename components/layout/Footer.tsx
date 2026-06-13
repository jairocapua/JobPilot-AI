import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full bg-surface border-t border-border">
      <div className="max-w-[1440px] mx-auto h-16 flex items-center justify-between px-6">
        <Link href="/">
          <Image src="/logo.png" alt="JobPilot" width={120} height={30} className="h-7 w-auto" />
        </Link>

        <nav className="flex items-center gap-6">
          <Link href="/dashboard" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
            Dashboard
          </Link>
          <Link href="/privacy" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
            Terms & Condition
          </Link>
        </nav>
      </div>
    </footer>
  );
}
