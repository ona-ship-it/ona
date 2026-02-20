"use client";

import { useState } from "react";

type ThemeMode = "dark" | "light";
type PageMode = "home" | "profile" | "dashboard" | "wallet" | "settings" | "auth" | "create";

type Palette = {
  bg: string;
  bgCard: string;
  bgInput: string;
  text: string;
  textSec: string;
  textMuted: string;
  border: string;
  cyan: string;
  green: string;
  orange: string;
  blue: string;
};

const palettes: Record<ThemeMode, Palette> = {
  dark: {
    bg: "#0a1929",
    bgCard: "#1e293b",
    bgInput: "#0f1419",
    text: "#f8fafc",
    textSec: "#94a3b8",
    textMuted: "#64748b",
    border: "rgba(255,255,255,0.08)",
    cyan: "#22d3ee",
    green: "#10b981",
    orange: "#ff8800",
    blue: "#3b82f6",
  },
  light: {
    bg: "#ffffff",
    bgCard: "#f8fafc",
    bgInput: "#f1f5f9",
    text: "#0f172a",
    textSec: "#64748b",
    textMuted: "#94a3b8",
    border: "#e2e8f0",
    cyan: "#0891b2",
    green: "#10b981",
    orange: "#ea580c",
    blue: "#3b82f6",
  },
};

function Icon({ name, color, size = 18 }: { name: string; color: string; size?: number }) {
  const iconStyle = { width: size, height: size, display: "inline-block", verticalAlign: "middle" } as const;
  const iconPathProps = {
    fill: "none",
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (name) {
    case "home":
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" {...iconPathProps}>
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case "gift":
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" {...iconPathProps}>
          <polyline points="20 12 20 22 4 22 4 12" />
          <rect x="2" y="7" width="20" height="5" />
          <line x1="12" y1="22" x2="12" y2="7" />
          <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" />
          <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
        </svg>
      );
    case "plus":
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" {...iconPathProps} strokeWidth={2.5}>
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      );
    case "heart":
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" {...iconPathProps}>
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
        </svg>
      );
    case "user":
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" {...iconPathProps}>
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    case "chev":
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" {...iconPathProps}>
          <polyline points="9 18 15 12 9 6" />
        </svg>
      );
    case "eye":
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" {...iconPathProps}>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case "bell":
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" {...iconPathProps}>
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
      );
    case "link":
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" {...iconPathProps}>
          <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
        </svg>
      );
    case "lock":
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" {...iconPathProps}>
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
      );
    case "mail":
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" {...iconPathProps}>
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      );
    case "phone":
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" {...iconPathProps}>
          <rect x="5" y="2" width="14" height="20" rx="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
      );
    case "moon":
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" {...iconPathProps}>
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
      );
    case "globe":
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" {...iconPathProps}>
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
        </svg>
      );
    case "help":
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" {...iconPathProps}>
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    case "msg":
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" {...iconPathProps}>
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
      );
    case "file":
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" {...iconPathProps}>
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      );
    case "logout":
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" {...iconPathProps}>
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      );
    case "dollar":
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" {...iconPathProps}>
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
        </svg>
      );
    case "download":
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" {...iconPathProps}>
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      );
    case "upload":
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" {...iconPathProps}>
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      );
    case "send":
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" {...iconPathProps}>
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      );
    case "shield":
      return (
        <svg style={{ width: size, height: size }} viewBox="0 0 24 24">
          <path fill={color} d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm-2 16l-4-4 1.41-1.41L10 15.17l6.59-6.59L18 10l-8 8z" />
        </svg>
      );
    case "star":
      return (
        <svg style={{ width: size, height: size }} viewBox="0 0 24 24">
          <path fill={color} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      );
    case "trending":
      return (
        <svg style={{ width: size, height: size }} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
      );
    case "verified":
      return (
        <svg style={{ width: size, height: size }} viewBox="0 0 24 24">
          <path fill={color} stroke="#0f1419" strokeWidth="2" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L18 10l-8 8z" />
        </svg>
      );
    case "cart":
      return (
        <svg style={{ width: size, height: size }} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
        </svg>
      );
    case "menu":
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" {...iconPathProps}>
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      );
    case "check":
      return (
        <svg style={{ width: size, height: size }} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );
    case "google":
      return (
        <svg style={{ width: 16, height: 16 }} viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
      );
    default:
      return null;
  }
}

function HeaderBar({ palette, small }: { palette: Palette; small: boolean }) {
  return (
    <div style={{ background: palette.bg, borderBottom: `1px solid ${palette.border}`, padding: small ? "10px 14px" : "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ fontWeight: 800, fontSize: small ? 18 : 20, color: palette.text, letterSpacing: -0.5 }}>ONAGUI</span>
      {!small && (
        <div style={{ display: "flex", gap: 22 }}>
          {["Home", "Giveaways", "Raffles", "Fundraise", "Marketplace", "Profiles"].map((item) => (
            <span key={item} style={{ fontSize: 12, fontWeight: 500, color: palette.textSec, cursor: "pointer" }}>{item}</span>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button style={{ padding: "5px 14px", border: `1.5px solid ${palette.border}`, borderRadius: 8, background: "transparent", color: palette.text, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Sign In</button>
        <button style={{ padding: "5px 14px", border: "none", borderRadius: 8, background: palette.green, color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>+ Create</button>
        {small && <span style={{ marginLeft: 2 }}><Icon name="menu" color={palette.textSec} size={20} /></span>}
      </div>
    </div>
  );
}

function BottomNavigation({ palette, active, theme }: { palette: Palette; active: string; theme: ThemeMode }) {
  const navItems = [
    { icon: "home", label: "Home", id: "home" },
    { icon: "gift", label: "Giveaways", id: "giveaways" },
    { icon: "plus", label: "Create", id: "create", isCreate: true },
    { icon: "heart", label: "Fundraise", id: "fundraise" },
    { icon: "user", label: "Profile", id: "profile" },
  ];

  return (
    <div style={{ background: palette.bg, borderTop: `1px solid ${palette.border}`, display: "flex", justifyContent: "space-around", alignItems: "center", padding: "5px 0 8px" }}>
      {navItems.map((item) => (
        <div key={item.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, cursor: "pointer" }}>
          {item.isCreate ? (
            <div style={{ width: 36, height: 36, borderRadius: 10, background: palette.green, display: "flex", alignItems: "center", justifyContent: "center", marginTop: -8 }}>
              <Icon name="plus" color="#fff" size={22} />
            </div>
          ) : (
            <Icon name={item.icon} color={active === item.id ? palette.cyan : palette.textMuted} size={20} />
          )}
          <span style={{ fontSize: 8, fontWeight: active === item.id ? 600 : 400, color: active === item.id ? palette.cyan : palette.textMuted }}>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function GiveawayCard({ palette, title, price, host, tag, theme }: { palette: Palette; title: string; price: string; host: string; tag: string; theme: ThemeMode }) {
  return (
    <div style={{ background: palette.bgCard, border: `1px solid ${palette.border}`, borderRadius: 14, overflow: "hidden", cursor: "pointer" }}>
      <div style={{ position: "relative", height: 120, overflow: "hidden" }}>
        <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#0f2027,#203a43,#2c5364)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "55%", background: "linear-gradient(to top,rgba(15,20,25,0.95),transparent)" }} />
        <div style={{ position: "absolute", top: 8, left: 8, display: "flex", alignItems: "center", gap: 3, background: "linear-gradient(135deg,#ff4400,#ff8800)", color: "#fff", padding: "2px 8px", borderRadius: 10, fontSize: 8, fontWeight: 700, letterSpacing: 0.6 }}>
          <Icon name="trending" color="#fff" size={10} /><span>TRENDING</span>
        </div>
        <div style={{ position: "absolute", top: 8, right: 8, width: 24, height: 24, background: "rgba(15,20,25,0.8)", border: "1.5px solid #3b82f6", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="verified" color="#00d4d4" size={14} />
        </div>
      </div>
      <div style={{ padding: "10px 12px 12px" }}>
        <div style={{ display: "inline-flex", padding: "1px 6px", borderRadius: 999, background: "rgba(0,212,212,0.1)", color: "#3b82f6", fontSize: 8, fontWeight: 600, marginBottom: 6 }}>{tag}</div>
        <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 13, fontWeight: 700, color: palette.text, lineHeight: 1.2 }}>{title}</div>
        <div style={{ fontSize: 9, color: "#718096", marginTop: 1, marginBottom: 6 }}>by <span style={{ color: "#3b82f6", fontWeight: 600 }}>{host}</span></div>
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <span style={{ fontFamily: "'Rajdhani'", fontSize: 12, color: "#ff8800", fontWeight: 600 }}>$</span>
          <span style={{ fontFamily: "'Rajdhani'", fontSize: 22, fontWeight: 700, color: "#ff8800" }}>{price}</span>
        </div>
        <button style={{ width: "100%", padding: "7px 0", border: "none", borderRadius: 7, background: "linear-gradient(135deg,#3b82f6,#2563eb)", color: "#fff", fontFamily: "'Rajdhani'", fontSize: 10, fontWeight: 700, letterSpacing: 1, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
          <Icon name="cart" color="#fff" size={11} /> CLAIM FREE TICKET
        </button>
      </div>
    </div>
  );
}

function SettingsRow({ palette, icon, label, right, last }: { palette: Palette; icon: string; label: string; right?: React.ReactNode; last?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "12px 14px", borderBottom: last ? "none" : `1px solid ${palette.border}`, cursor: "pointer" }}>
      <span style={{ marginRight: 12 }}><Icon name={icon} color={palette.textSec} /></span>
      <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: palette.text }}>{label}</span>
      {right || <Icon name="chev" color={palette.textMuted} size={14} />}
    </div>
  );
}

function HomeScreen({ palette, theme }: { palette: Palette; theme: ThemeMode }) {
  const cards = [
    { title: "iPhone 16 Pro", price: "1,299", host: "TechKing", tag: "Hot Right Now" },
    { title: "PS5 Bundle", price: "699", host: "GamerzHub", tag: "Ending Soon" },
  ];

  return (
    <div>
      <div style={{ background: palette.bg, padding: "32px 20px 24px", textAlign: "center" }}>
        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 40, fontWeight: 800, color: palette.text, margin: 0, letterSpacing: -1 }}>ONAGUI</h1>
        <p style={{ fontSize: 13, color: palette.textSec, margin: "6px 0 14px" }}>Your best chance to win</p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", paddingTop: 12, borderTop: `1px solid ${palette.border}` }}>
          {["100% Secure", "Verified Winners", "Instant Payouts"].map((text) => (
            <span key={text} style={{ fontSize: 9, color: palette.textMuted, display: "flex", alignItems: "center", gap: 3 }}>
              <Icon name="shield" color={palette.green} size={12} /> {text}
            </span>
          ))}
        </div>
      </div>
      <div style={{ padding: "14px 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {cards.map((card) => <GiveawayCard key={card.title} palette={palette} theme={theme} {...card} />)}
        </div>
      </div>
    </div>
  );
}

function ProfileScreen({ palette, theme }: { palette: Palette; theme: ThemeMode }) {
  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", border: "3px solid rgba(16,185,129,0.5)" }} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: palette.text }}>@TechKing</span>
            <span style={{ fontSize: 9, fontWeight: 700, color: palette.green, background: "rgba(16,185,129,0.12)", padding: "4px 10px", borderRadius: 99 }}>98% CREDIBLE</span>
          </div>
          <p style={{ fontSize: 11, color: palette.textSec, margin: "4px 0 0" }}>Verified creator since 2024</p>
        </div>
        <Icon name="chev" color={palette.textMuted} size={14} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 14 }}>
        {[["547", "GIVEAWAYS"], ["$2.3M", "TOTAL VALUE"], ["125.4K", "FOLLOWERS"]].map(([value, label]) => (
          <div key={label} style={{ background: palette.bgCard, border: `1px solid ${palette.border}`, borderRadius: 12, padding: "12px 8px", textAlign: "center" }}>
            <div style={{ color: palette.green, fontSize: 18, fontWeight: 800 }}>{value}</div>
            <div style={{ color: palette.textMuted, fontSize: 8, letterSpacing: 1, marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        {["LIVE NOW", "HISTORY", "POPULAR", "WINNERS"].map((tab, index) => (
          <span key={tab} style={{ fontSize: 11, fontWeight: index === 0 ? 700 : 600, color: index === 0 ? palette.text : palette.textMuted, background: index === 0 ? palette.bgCard : "transparent", border: index === 0 ? `1px solid ${palette.border}` : "none", borderRadius: 10, padding: "8px 12px" }}>{tab}</span>
        ))}
      </div>

      <div style={{ background: palette.bgCard, border: `1px solid ${palette.border}`, borderRadius: 16, padding: "24px 12px", textAlign: "center", color: palette.textMuted, fontSize: 14 }}>
        No active giveaways
      </div>
    </div>
  );
}

function DashboardScreen({ palette, theme }: { palette: Palette; theme: ThemeMode }) {
  return (
    <div style={{ padding: 16 }}>
      <div style={{ background: "linear-gradient(135deg,#10b981,#059669)", borderRadius: 14, padding: "18px 16px", marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>Total Balance</span>
          <Icon name="eye" color="rgba(255,255,255,0.55)" size={16} />
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, color: "#fff" }}>$12.50 <span style={{ fontSize: 13, fontWeight: 500 }}>USDC</span></div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 10 }}>
        {[["3", "ENTERED"], ["1", "WON"], ["7", "SAVED"]].map(([value, label]) => (
          <div key={label} style={{ background: palette.bgCard, border: `1px solid ${palette.border}`, borderRadius: 12, textAlign: "center", padding: "14px 8px" }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: palette.text }}>{value}</div>
            <div style={{ fontSize: 8, letterSpacing: 1, marginTop: 3, color: palette.textMuted }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 14 }}>
        {[["download", "Deposit", true], ["upload", "Withdraw", false], ["send", "Transfer", false]].map(([icon, label, primary], index) => (
          <div key={index} style={{ background: primary ? palette.green : palette.bgCard, border: primary ? "none" : `1px solid ${palette.border}`, borderRadius: 12, textAlign: "center", padding: "14px 8px" }}>
            <div style={{ marginBottom: 5 }}><Icon name={icon as string} color={primary ? "#fff" : palette.textMuted} size={16} /></div>
            <div style={{ fontSize: 11, color: primary ? "#fff" : palette.text, fontWeight: 700 }}>{label}</div>
          </div>
        ))}
      </div>

      <h3 style={{ margin: "0 0 10px", color: palette.text, fontSize: 14, fontWeight: 800 }}>Recent Activity</h3>
      <div style={{ background: palette.bgCard, border: `1px solid ${palette.border}`, borderRadius: 14, overflow: "hidden" }}>
        {[
          ["Entered giveaway", "iPhone 16 Pro", "-1 USDC", "2h ago"],
          ["Won prize", "$50 USDC", "+50 USDC", "1d ago"],
          ["Deposit", "USDC", "+100 USDC", "3d ago"],
        ].map(([title, detail, amount, time], index) => (
          <div key={index} style={{ display: "flex", alignItems: "center", padding: "12px 14px", borderBottom: index < 2 ? `1px solid ${palette.border}` : "none" }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: palette.text, fontSize: 12, fontWeight: 700 }}>{title}</div>
              <div style={{ color: palette.textSec, fontSize: 9 }}>{detail}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: (amount as string).startsWith("+") ? palette.green : palette.textSec, fontSize: 12, fontWeight: 700 }}>{amount}</div>
              <div style={{ color: palette.textMuted, fontSize: 9 }}>{time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WalletScreen({ palette }: { palette: Palette }) {
  const coins = [
    ["USDC", "12.500000", "$12.50", "#3b82f6", "U"],
    ["ETH", "0.000000", "$0.00", "#5b7cfa", "E"],
    ["BTC", "0.000000", "$0.00", "#f59e0b", "B"],
    ["BNB", "0.000000", "$0.00", "#fbbf24", "B"],
    ["SOL", "0.000000", "$0.00", "#7c3aed", "S"],
    ["USDT", "0.000000", "$0.00", "#10b981", "U"],
  ] as const;

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: palette.textSec }}>Total Value</span>
        <Icon name="eye" color={palette.textMuted} size={16} />
      </div>
      <div style={{ fontSize: 52, lineHeight: 0.95, fontWeight: 800, color: palette.text, marginBottom: 10 }}>
        12.50 <span style={{ fontSize: 36 / 2, fontWeight: 600, color: palette.textSec }}>USDC</span>
      </div>
      <div style={{ fontSize: 32 / 2, color: palette.textSec, marginBottom: 18 }}>≈ $12.50 USD</div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 20 }}>
        {["Deposit", "Withdraw", "Transfer"].map((label, index) => (
          <button
            key={label}
            style={{
              padding: "13px 0",
              borderRadius: 14,
              border: "none",
              background: index === 0 ? palette.green : palette.bgCard,
              color: index === 0 ? "#fff" : palette.text,
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <h3 style={{ margin: "0 0 10px", fontSize: 18 / 1.2, color: palette.text, fontWeight: 700 }}>Crypto</h3>
      <div style={{ background: palette.bgCard, border: `1px solid ${palette.border}`, borderRadius: 16, overflow: "hidden" }}>
        {coins.map(([name, balance, usd, color, symbol], index) => (
          <div key={name} style={{ display: "flex", alignItems: "center", padding: "14px 14px", borderBottom: index < coins.length - 1 ? `1px solid ${palette.border}` : "none" }}>
            <div style={{ width: 42 / 1.25, height: 42 / 1.25, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13 / 1.25, fontWeight: 700, marginRight: 12 }}>{symbol}</div>
            <div>
              <div style={{ color: palette.text, fontSize: 16 / 1.25, fontWeight: 700 }}>{name}</div>
              <div style={{ color: palette.textSec, fontSize: 14 / 1.25 }}>{balance} ≈ {usd}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsScreen({ palette, theme }: { palette: Palette; theme: ThemeMode }) {
  const darkMode = theme === "dark";
  const sections = [
    { title: "Account", items: [["user", "Profile"], ["bell", "Notifications"], ["link", "Connected Wallets"]] },
    { title: "Security", items: [["lock", "Security"], ["mail", "Email Verification", "verified"], ["phone", "2FA"]] },
    { title: "Preferences", items: [["moon", "Dark Mode", "toggle"], ["globe", "Language", "English"], ["dollar", "Currency", "USD"]] },
    { title: "Support", items: [["help", "Help Center"], ["msg", "Contact Support"], ["file", "Terms of Service"], ["lock", "Privacy Policy"]] },
  ] as const;

  const renderRight = (value?: string) => {
    if (!value) return null;
    if (value === "verified") return <span style={{ fontSize: 9, color: palette.green, fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}><Icon name="check" color={palette.green} size={12} /> Verified</span>;
    if (value === "toggle") return <div style={{ width: 32, height: 18, borderRadius: 9, background: palette.cyan, padding: 2 }}><div style={{ width: 14, height: 14, borderRadius: 7, background: "#fff", marginLeft: 14 }} /></div>;
    return <span style={{ fontSize: 10, color: palette.textMuted }}>{value}</span>;
  };

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18, padding: "6px 0" }}>
        <div style={{ width: 66 / 1.2, height: 66 / 1.2, borderRadius: "50%", background: "linear-gradient(135deg,#3b82f6,#8b5cf6)" }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18 / 1.2, fontWeight: 700, color: palette.text }}>TechKing</div>
          <div style={{ fontSize: 16 / 1.45, color: palette.textSec }}>techking@email.com</div>
        </div>
        <Icon name="chev" color={palette.textMuted} size={16} />
      </div>

      {sections.map((section) => (
        <div key={section.title} style={{ marginBottom: 14 }}>
          <h3 style={{ fontSize: 11, fontWeight: 700, color: palette.textMuted, textTransform: "uppercase", letterSpacing: 1.1, margin: "0 0 8px 4px" }}>{section.title}</h3>
          <div style={{ background: palette.bgCard, border: `1px solid ${palette.border}`, borderRadius: 12, overflow: "hidden" }}>
            {section.items.map(([icon, label, right], index) => (
              <SettingsRow key={`${section.title}-${label}`} palette={palette} icon={icon} label={label} right={renderRight(right)} last={index === section.items.length - 1} />
            ))}
          </div>
        </div>
      ))}
      <button style={{ width: "100%", padding: 12, border: "none", borderRadius: 10, background: darkMode ? "#1e293b" : "#f1f5f9", color: palette.textSec, fontSize: 13, fontWeight: 600, cursor: "pointer", marginBottom: 6, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <Icon name="logout" color={palette.textSec} /> Log Out
      </button>
    </div>
  );
}

function AuthScreen({ palette }: { palette: Palette }) {
  const [tab, setTab] = useState<"signin" | "signup">("signin");

  return (
    <div style={{ padding: "24px 16px", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: palette.text, marginBottom: 20 }}>ONAGUI</h1>
      <div style={{ width: "100%", maxWidth: 340 }}>
        <div style={{ display: "flex", marginBottom: 18, background: palette.bgCard, borderRadius: 10, padding: 3, border: `1px solid ${palette.border}` }}>
          {["signin", "signup"].map((item) => (
            <button key={item} onClick={() => setTab(item as "signin" | "signup")} style={{ flex: 1, padding: 8, border: "none", borderRadius: 8, background: tab === item ? palette.green : "transparent", color: tab === item ? "#fff" : palette.textSec, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              {item === "signin" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>
        <button style={{ width: "100%", padding: 14 / 1.2, border: `1px solid ${palette.border}`, borderRadius: 14 / 1.2, background: "#111317", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 18 }}>
          <Icon name="google" color="" /> Continue with Google
        </button>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
          <span style={{ fontSize: 11, color: palette.textSec }}>Or continue with email</span>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", fontSize: 11, color: palette.textSec, marginBottom: 6 }}>Email</label>
          <div style={{ background: palette.bgInput, border: `1px solid ${palette.border}`, borderRadius: 11, padding: "11px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ color: palette.textSec, fontSize: 11 }}>your@email.com</span>
            <span style={{ width: 24, height: 24, borderRadius: 6, background: "#aeb8c4", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14 }}>•••</span>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 11, color: palette.textSec, marginBottom: 6 }}>Password</label>
          <div style={{ background: palette.bgInput, border: `1px solid ${palette.border}`, borderRadius: 11, padding: "11px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ color: palette.textSec, fontSize: 11 }}>••••••••</span>
            <span style={{ width: 24, height: 24, borderRadius: 6, background: "#aeb8c4", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14 }}>•••</span>
          </div>
        </div>

        <button style={{ width: "100%", padding: "14px 0", borderRadius: 14 / 1.2, border: "none", background: palette.green, color: "#fff", fontSize: 16 / 1.2, fontWeight: 700, cursor: "pointer" }}>Sign In</button>
      </div>
    </div>
  );
}

function CreateScreen({ palette }: { palette: Palette }) {
  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16, gap: 4 }}>
        {[1, 2, 3, 4].map((step) => (
          <div key={step} style={{ display: "flex", alignItems: "center", flex: 1 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 / 1.2, fontWeight: 700, background: step === 1 ? palette.green : palette.bgCard, color: step === 1 ? "#fff" : palette.textMuted }}>{step}</div>
            {step < 4 && <div style={{ flex: 1, height: 2, marginLeft: 4, background: palette.bgCard, borderRadius: 1 }} />}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
        {[
          ["Details", true],
          ["Prize", false],
          ["Tickets", false],
          ["Schedule", false],
        ].map(([label, active]) => (
          <span key={label as string} style={{ fontSize: 10, color: active ? palette.green : palette.textSec, fontWeight: active ? 600 : 400 }}>{label}</span>
        ))}
      </div>

      <div style={{ background: palette.bgCard, border: `1px solid ${palette.border}`, borderRadius: 14, padding: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: palette.text, margin: "0 0 4px" }}>Create Your Giveaway</h2>
        <p style={{ fontSize: 11, color: palette.textSec, margin: "0 0 14px" }}>Let's start with the basics</p>
        <div style={{ border: `2px dashed ${palette.border}`, borderRadius: 12, padding: "24px 16px", textAlign: "center", marginBottom: 14, cursor: "pointer" }}>
          <div style={{ marginBottom: 6 }}><Icon name="upload" color={palette.textMuted} /></div>
          <p style={{ fontSize: 11, fontWeight: 600, color: palette.text, margin: "0 0 2px" }}>Click to upload image</p>
          <p style={{ fontSize: 10, color: palette.textSec, margin: 0 }}>PNG, JPG, GIF up to 5MB</p>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label style={{ display: "block", fontSize: 11, color: palette.textSec, marginBottom: 5 }}>Title</label>
          <div style={{ background: palette.bgInput, borderRadius: 11, border: `1px solid ${palette.border}`, padding: "11px 12px", fontSize: 12, color: palette.textSec }}>Amazing Prize Giveaway</div>
        </div>

        <div>
          <label style={{ display: "block", fontSize: 11, color: palette.textSec, marginBottom: 5 }}>Description</label>
          <div style={{ background: palette.bgInput, borderRadius: 11, border: `1px solid ${palette.border}`, padding: "11px 12px", fontSize: 12, color: palette.textSec, minHeight: 68 }}>Describe your giveaway...</div>
        </div>
      </div>
    </div>
  );
}

function renderScreen(page: PageMode, palette: Palette, theme: ThemeMode) {
  switch (page) {
    case "home": return <HomeScreen palette={palette} theme={theme} />;
    case "profile": return <ProfileScreen palette={palette} theme={theme} />;
    case "dashboard": return <DashboardScreen palette={palette} theme={theme} />;
    case "wallet": return <WalletScreen palette={palette} />;
    case "settings": return <SettingsScreen palette={palette} theme={theme} />;
    case "auth": return <AuthScreen palette={palette} />;
    case "create": return <CreateScreen palette={palette} />;
    default: return <HomeScreen palette={palette} theme={theme} />;
  }
}

export default function OnaguiRedesign({ page }: { page: PageMode }) {
  const theme: ThemeMode = "light";
  const palette = palettes[theme];
  const navActive = page === "home" ? "home" : page === "create" ? "create" : ["profile", "dashboard", "settings", "wallet"].includes(page) ? "profile" : "home";

  return (
    <div style={{ fontFamily: "'Inter',system-ui,sans-serif", background: "#060d16", minHeight: "100vh", padding: 12 }}>
      <div style={{ width: 310, margin: "0 auto", background: palette.bg, borderRadius: 28, overflow: "hidden", border: "3px solid #4b5a6f", boxShadow: "0 20px 60px rgba(0,0,0,0.5)", position: "relative", display: "flex", flexDirection: "column" }}>
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 90, height: 20, background: "#1e2a3f", borderRadius: "0 0 12px 12px", zIndex: 10 }} />
        <div style={{ paddingTop: 20 }}>
          <HeaderBar palette={palette} small={true} />
        </div>
        <div style={{ flex: 1, maxHeight: 700, overflowY: "auto" }}>
          {renderScreen(page, palette, theme)}
        </div>
        {page !== "auth" && <BottomNavigation palette={palette} theme={theme} active={navActive} />}
      </div>
    </div>
  );
}
