"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/find-jobs", label: "Find Jobs" },
  { href: "/profile", label: "Profile" },
];

export function NavLinks() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <nav className="flex items-center gap-8">
      {NAV_LINKS.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={`text-sm font-medium transition-colors ${
            pathname.startsWith(href)
              ? "text-accent"
              : "text-text-dark hover:text-accent"
          }`}
        >
          {label}
        </Link>
      ))}
      <button
        onClick={handleLogout}
        className="text-sm font-medium text-text-dark hover:text-accent transition-colors"
      >
        Logout
      </button>
    </nav>
  );
}
