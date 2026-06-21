"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleUserRound, LayoutGrid, Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type NavLink = {
  href: string;
  label: string;
  Icon: LucideIcon;
};

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", Icon: LayoutGrid },
  { href: "/find-jobs", label: "Find Jobs", Icon: Search },
  { href: "/profile", label: "Profile", Icon: CircleUserRound },
];

export function NavLinks(): ReactElement {
  const pathname = usePathname();

  return (
    <nav className="flex h-full items-center gap-7">
      {NAV_LINKS.map(({ href, label, Icon }: NavLink) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            className={`relative flex h-16 items-center gap-2 text-sm font-medium transition-colors ${
              active ? "text-accent" : "text-text-dark hover:text-accent"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
            {active ? (
              <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-accent" />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
