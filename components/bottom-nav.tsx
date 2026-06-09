"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Inbox, CheckCircle2, Settings } from "lucide-react";

const TABS = [
  { href: "/", label: "Discover", icon: Compass },
  { href: "/queue", label: "Queue", icon: Inbox },
  { href: "/applied", label: "Applied", icon: CheckCircle2 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav">
      {TABS.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`bottom-nav-item ${active ? "active" : ""}`}
          >
            <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
