import type { ReactElement } from "react";
import Image from "next/image";
import Link from "next/link";
import { LogoutButton } from "./LogoutButton";
import { NavLinks } from "./NavLinks";

type Props = {
  ctaHref?: string;
  showCta?: boolean;
  showLogout?: boolean;
};

export function Navbar({
  ctaHref = "/login",
  showCta = true,
  showLogout = false,
}: Props): ReactElement {
  return (
    <header className="w-full bg-surface border-b border-border">
      <div className="max-w-[1440px] mx-auto h-16 flex items-center justify-between px-6">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="JobPilot"
            width={120}
            height={30}
            className="h-7 w-auto"
          />
        </Link>

        <div className="flex h-full items-center gap-8">
          <NavLinks />
          {showCta ? (
            <Link
              href={ctaHref}
              className="bg-overlay-dark text-overlay-foreground text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              Start for free
            </Link>
          ) : null}
          {showLogout ? <LogoutButton /> : null}
        </div>
      </div>
    </header>
  );
}
