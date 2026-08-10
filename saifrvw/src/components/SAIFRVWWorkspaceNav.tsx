"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Home" },
  { href: "/review", label: "Review" },
  { href: "/dependencies", label: "Dependencies" },
  { href: "/secrets", label: "Secrets" },
  { href: "/docs", label: "Docs" },
  { href: "/pricing", label: "Pricing" },
];

export default function SAIFRVWWorkspaceNav() {
  const pathname = usePathname();

  return (
    <div className="saifrvw-workspace-shell">
      <nav className="saifrvw-workspace-nav" aria-label="SAIFRVW workspace">
        <Link href="/" className="saifrvw-brand">
          <span className="saifrvw-brand-mark">S</span>
          <span>
            <strong>SAIFRVW</strong>
            <small>Sentinel Security</small>
          </span>
        </Link>

        <div className="saifrvw-nav-links">
          {items.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`saifrvw-nav-link ${active ? "active" : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <Link href="/review" className="saifrvw-launch">
          Open Review
          <span>→</span>
        </Link>
      </nav>
    </div>
  );
}
