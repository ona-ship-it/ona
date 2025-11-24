"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import type { ComponentType } from "react";

type NavItem = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
};

const IconHome = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 10.5l9-7 9 7M5 10v9a2 2 0 002 2h3a2 2 0 002-2v-4h2v4a2 2 0 002 2h3a2 2 0 002-2v-9" />
  </svg>
);

const IconUser = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <circle cx="12" cy="7" r="4" strokeWidth="2" />
    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
  </svg>
);

const IconMenu = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const IconGift = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M20 12v8a2 2 0 01-2 2H6a2 2 0 01-2-2v-8" />
    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M12 22V8" />
    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3-1.343-3-3s1.343-3 3-3c.943 0 1.787.417 2.357 1.077M12 8c1.657 0 3-1.343 3-3 0-.634-.196-1.223-.53-1.707" />
  </svg>
);


const IconTarget = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <circle cx="12" cy="12" r="8" strokeWidth="2" />
    <circle cx="12" cy="12" r="3" strokeWidth="2" />
    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 2v2M2 12h2M12 20v2M20 12h2" />
  </svg>
);

const IconCog = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317a1 1 0 011.35-.436l.47.235a1 1 0 00.91-.02l.43-.23a1 1 0 011.35.435l.234.47a1 1 0 00.75.54l.51.102a1 1 0 01.82.78l.102.51a1 1 0 00.54.75l.47.235a1 1 0 01.436 1.35l-.23.43a1 1 0 00.02.91l.235.47a1 1 0 01-.435 1.35l-.47.234a1 1 0 00-.54.75l-.102.51a1 1 0 01-.78.82l-.51.102a1 1 0 00-.75.54l-.234.47a1 1 0 01-1.35.436l-.43-.23a1 1 0 00-.91.02l-.47.235a1 1 0 01-1.35-.435l-.235-.47a1 1 0 00-.75-.54l-.51-.102a1 1 0 01-.82-.78l-.102-.51a1 1 0 00-.54-.75l-.47-.234a1 1 0 01-.436-1.35l.23-.43a1 1 0 00-.02-.91l-.235-.47z" />
    <circle cx="12" cy="12" r="3" strokeWidth="2" />
  </svg>
);

const IconPalette = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 22a10 10 0 100-20 10 10 0 000 20z" />
    <circle cx="7" cy="12" r="1" />
    <circle cx="12" cy="7" r="1" />
    <circle cx="17" cy="12" r="1" />
    <circle cx="12" cy="17" r="1" />
  </svg>
);

const IconUsers = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M17 20v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" strokeWidth="2" />
    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M23 20v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
  </svg>
);

const IconChat = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
);

const IconChart = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18" />
    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M7 13l3 3 7-7" />
  </svg>
);

const IconHandshake = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 12l4-4 4 4 4-4 4 4" />
    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 16l4-4 4 4 4-4 4 4" />
  </svg>
);

const navItems: NavItem[] = [
  { label: "Home", href: "/", icon: IconHome },
  { label: "My Profile", href: "/profile", icon: IconUser },
  { label: "My Account", href: "/account", icon: IconUser },
  { label: "Giveaways", href: "/giveaways", icon: IconGift },
  { label: "Fundraise", href: "/fundraise", icon: IconTarget },
  { label: "Raffles", href: "/raffles", icon: IconChart },
  { label: "Marketplace", href: "/marketplace", icon: IconHandshake },
  { label: "Creator", href: "/view-profile", icon: IconUsers },
  { label: "Community", href: "/community", icon: IconChat },
  { label: "Theme", href: "/docs", icon: IconPalette },
  { label: "Settings", href: "/settings", icon: IconCog },
];

export default function Sidebar() {
  const [expanded, setExpanded] = useState(false);
  const supabase = createClientComponentClient();
  const router = useRouter();

  // Initialize from localStorage on mount
  useEffect(() => {
    try {
      const saved = typeof window !== "undefined" ? localStorage.getItem("onagui-sidebar-expanded") : null;
      if (saved !== null) {
        setExpanded(saved === "true");
      }
    } catch {}
  }, []);

  useEffect(() => {
    // Adjust CSS variable for main content offset (desktop only)
    const isDesktop = typeof window !== "undefined" && window.innerWidth >= 640;
    const width = expanded ? 240 : isDesktop ? 72 : 0;
    document.documentElement.style.setProperty("--sidebar-width", `${width}px`);
    // Persist state
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("onagui-sidebar-expanded", expanded ? "true" : "false");
      }
    } catch {}
  }, [expanded]);

  return (
    <aside
      className="hidden sm:flex fixed left-0 top-0 z-40 h-screen border-r border-gray-800 bg-gray-900 text-gray-100"
      style={{ width: expanded ? 240 : 72 }}
    >
      <div className="flex flex-col w-full h-full">
        {/* Header / Toggle */}
        <div className="flex items-center justify-between p-3 border-b border-gray-800">
          <button
            aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
            onClick={() => setExpanded((v) => !v)}
            className="p-2 rounded-md bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <IconMenu className="w-5 h-5" />
          </button>
          {expanded && (
            <span className="text-sm font-medium">Onagui</span>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto py-2">
          <ul className="space-y-1">
            {navItems.map(({ label, href, icon: Icon }) => (
              <li key={label}>
                <Link
                  href={href}
                  prefetch={href === "/giveaways" || href === "/marketplace" || href === "/raffles" || href === "/fundraise" ? false : undefined}
                  className="group relative flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-800 rounded-md transition-colors"
                  aria-label={label}
                  title={label}
                >
                  <Icon className="w-5 h-5 text-gray-300 group-hover:text-white" />
                  {expanded && <span className="truncate">{label}</span>}
                  {!expanded && (
                    <span className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {label}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer: Sign Out action moved from navbar */}
        <div className="p-3 border-t border-gray-800 text-xs text-gray-400 flex items-center justify-between">
          {expanded ? <span>v1.0 • Dark Mode</span> : <span className="block text-center">•</span>}
          <button
            onClick={async () => { await supabase.auth.signOut(); router.push('/'); }}
            className="ml-2 px-3 py-1 text-xs rounded-md bg-red-600 text-white hover:bg-red-700"
            aria-label="Sign Out"
          >
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}