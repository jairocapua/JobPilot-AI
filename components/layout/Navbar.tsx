import Image from "next/image";
import Link from "next/link";
import { NavLinks } from "./NavLinks";

type Props = {
  ctaHref?: string;
  showCta?: boolean;
};

export function Navbar({ ctaHref = "/login", showCta = true }: Props) {
  return (
    <header className="w-full bg-surface border-b border-border">
      <div className="max-w-[1440px] mx-auto h-16 flex items-center justify-between px-6">
        <Link href="/">
          <Image src="/logo.png" alt="JobPilot" width={120} height={30} className="h-7 w-auto" />
        </Link>

        <NavLinks />

        {showCta ? (
          <Link
            href={ctaHref}
            className="bg-overlay-dark text-overlay-foreground text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            Start for free
          </Link>
        ) : (
          <div className="w-24" />
        )}
      </div>
    </header>
  );
}
