"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  Kanban,
  Settings,
  Briefcase,
} from "lucide-react";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/search", label: "Search Jobs", icon: Search },
  { href: "/pipeline", label: "Pipeline", icon: Kanban },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: 220,
        height: "100vh",
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        zIndex: 50,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "20px 18px 16px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <Briefcase size={18} color="var(--accent)" />
        <span style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>
          Job Hunter
        </span>
      </div>

      {/* Links */}
      <div style={{ flex: 1, padding: "12px 8px" }}>
        {links.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 10px",
                borderRadius: 6,
                marginBottom: 2,
                color: active ? "var(--accent)" : "var(--text-muted)",
                background: active ? "var(--accent-dim)" : "transparent",
                textDecoration: "none",
                fontSize: 13,
                fontWeight: active ? 500 : 400,
                transition: "all 0.12s",
              }}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ padding: "14px 18px", borderTop: "1px solid var(--border)" }}>
        <div style={{ fontSize: 11, color: "var(--text-faint)", marginBottom: 2 }}>
          Michael Korenevsky
        </div>
        <div style={{ fontSize: 11, color: "var(--text-faint)" }}>
          Senior PM · Open to roles
        </div>
      </div>
    </nav>
  );
}
