"use client";

import { useState } from "react";

type ThemeMode = "dark" | "light";

type ColorScheme = {
  bg: string;
  bgCard: string;
  bgElevated: string;
  text: string;
  textSec: string;
  textMuted: string;
  border: string;
  borderStrong: string;
  cyan: string;
  green: string;
  orange: string;
  blue: string;
};

type GiveawayCardData = {
  title: string;
  price: string;
  host: string;
  highlight: string;
};

const Icons = {
  home: (color: string) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  gift: (color: string) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 12 20 22 4 22 4 12" />
      <rect x="2" y="7" width="20" height="5" />
      <line x1="12" y1="22" x2="12" y2="7" />
      <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
    </svg>
  ),
  plus: (color: string) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  heart: (color: string) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  ),
  user: (color: string) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  check: (color: string) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={color} stroke="none">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
  ),
  star: (color: string) => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill={color} stroke="none">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
  trending: (color: string) => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  verified: (color: string) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={color} stroke="#0f1419" strokeWidth="2">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
  ),
  bookmark: (color: string) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
    </svg>
  ),
  heartSmall: (color: string) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  ),
  chevron: (color: string) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  shield: (color: string) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={color} stroke="none">
      <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm-2 16l-4-4 1.41-1.41L10 15.17l6.59-6.59L18 10l-8 8z" />
    </svg>
  ),
  menu: (color: string) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  cart: (color: string) => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
    </svg>
  ),
};

const C: Record<ThemeMode, ColorScheme> = {
  dark: {
    bg: "#0a1929", bgCard: "#1e293b", bgElevated: "#152238",
    text: "#f8fafc", textSec: "#94a3b8", textMuted: "#64748b",
    border: "rgba(255,255,255,0.08)", borderStrong: "rgba(255,255,255,0.12)",
    cyan: "#22d3ee", green: "#10b981", orange: "#ff8800", blue: "#3b82f6",
  },
  light: {
    bg: "#ffffff", bgCard: "#f8fafc", bgElevated: "#f1f5f9",
    text: "#0f172a", textSec: "#64748b", textMuted: "#94a3b8",
    border: "#e2e8f0", borderStrong: "#cbd5e1",
    cyan: "#0891b2", green: "#10b981", orange: "#ea580c", blue: "#3b82f6",
  },
};

function GiveawayCard({ c, title, price, host, highlight, theme }: { c: ColorScheme; title: string; price: string; host: string; highlight: string; theme: ThemeMode }) {
  const [h, setH] = useState(false);
  const isDark = theme === "dark";
  return (
    <div
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        background: isDark ? "linear-gradient(135deg, rgba(20,26,32,0.8), rgba(15,20,25,0.9))" : c.bgCard,
        border: `1px solid ${h ? "rgba(0,212,212,0.5)" : isDark ? "rgba(0,212,212,0.15)" : c.border}`,
        borderRadius: 16, overflow: "hidden", cursor: "pointer",
        transform: h ? "translateY(-6px)" : "none",
        boxShadow: h ? (isDark ? "0 16px 48px rgba(0,212,212,0.15)" : "0 12px 36px rgba(0,0,0,0.12)") : "none",
        transition: "all 0.35s cubic-bezier(0.175,0.885,0.32,1.275)",
      }}
    >
      <div style={{ position: "relative", height: 150, overflow: "hidden" }}>
        <div
          style={{
            width: "100%", height: "100%",
            background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
            transition: "transform 0.5s", transform: h ? "scale(1.08)" : "scale(1)",
          }}
        />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "55%", background: "linear-gradient(to top, rgba(15,20,25,0.95), transparent)" }} />

        <div style={{ position: "absolute", top: 10, left: 10, display: "flex", alignItems: "center", gap: 4, background: "linear-gradient(135deg, #ff4400, #ff8800)", color: "#fff", padding: "3px 10px", borderRadius: 14, fontSize: 9, fontWeight: 700, letterSpacing: 0.8, zIndex: 2 }}>
          {Icons.trending("#fff")}
          <span>TRENDING</span>
        </div>

        <div style={{ position: "absolute", top: 10, right: 10, width: 28, height: 28, background: "rgba(15,20,25,0.8)", border: "2px solid #3b82f6", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2, backdropFilter: "blur(8px)" }}>
          {Icons.verified("#00d4d4")}
        </div>

        <div style={{ position: "absolute", bottom: 10, left: 10, background: "rgba(255,136,0,0.9)", color: "#0f1419", padding: "3px 10px", borderRadius: 6, fontSize: 9, fontWeight: 700, letterSpacing: 0.8, zIndex: 2 }}>
          GIVEAWAY
        </div>
      </div>

      <div style={{ padding: "12px 14px 14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(255,136,0,0.1)", border: "1px solid rgba(255,136,0,0.25)", padding: "3px 8px", borderRadius: 6, fontSize: 10, fontWeight: 600, color: "#ff8800" }}>
            {Icons.star("#ff8800")}
            <span>4.{Math.floor(Math.random() * 9)}</span>
            <span style={{ color: "#718096", fontSize: 9 }}>({50 + Math.floor(Math.random() * 200)})</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {Icons.heartSmall("#718096")}
            {Icons.bookmark("#718096")}
          </div>
        </div>

        <div style={{ display: "inline-flex", padding: "2px 7px", borderRadius: 999, background: "rgba(0,212,212,0.1)", color: "#3b82f6", fontSize: 9, fontWeight: 600, marginBottom: 8 }}>
          {highlight}
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 6 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", border: "1.5px solid rgba(0,212,212,0.4)" }} />
            <span style={{ fontSize: 7, fontWeight: 700, color: "#3b82f6", textTransform: "uppercase" }}>12 subs</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 15, fontWeight: 700, color: isDark ? "#fff" : c.text, margin: "0 0 2px", lineHeight: 1.2 }}>{title}</h3>
            <p style={{ fontSize: 10, color: "#718096", margin: 0 }}>Exclusive giveaway...</p>
          </div>
        </div>

        <div style={{ fontSize: 10, color: "#718096", marginBottom: 10 }}>
          by <span style={{ color: "#3b82f6", fontWeight: 600 }}>{host}</span>
        </div>

        <div style={{ textAlign: "center", marginBottom: 10 }}>
          <span style={{ fontFamily: "'Rajdhani'", fontSize: 14, color: "#ff8800", fontWeight: 600 }}>$</span>
          <span style={{ fontFamily: "'Rajdhani'", fontSize: 26, fontWeight: 700, color: "#ff8800" }}>{price}</span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#94a3b8", marginBottom: 10 }}>
          <span>Prize boost</span>
          <div style={{ fontFamily: "'Rajdhani'", fontWeight: 700, color: "#3b82f6", display: "flex", gap: 4 }}>
            <span>${price}</span>
            <span style={{ color: "#718096" }}>→</span>
            <span>${(parseInt(price.replace(/,/g, ""), 10) * 1.4).toLocaleString()}</span>
          </div>
        </div>

        <div style={{ display: "grid", gap: 4 }}>
          <button
            style={{
              width: "100%", padding: "8px 0", border: "none", borderRadius: 8,
              background: "linear-gradient(135deg, #3b82f6, #2563eb)", color: "#fff",
              fontFamily: "'Rajdhani'", fontSize: 11, fontWeight: 700, letterSpacing: 1.2,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
            }}
          >
            {Icons.cart("#fff")} CLAIM FREE TICKET
          </button>
          <button
            style={{
              width: "100%", padding: "6px 0", border: "1px solid rgba(0,212,212,0.4)", borderRadius: 8,
              background: "rgba(0,212,212,0.06)", color: "#3b82f6",
              fontFamily: "'Rajdhani'", fontSize: 10, fontWeight: 700, letterSpacing: 0.8, cursor: "pointer",
            }}
          >
            BUY TICKET 1 USDC
          </button>
          <div style={{ fontSize: 9, color: "#718096", textAlign: "center" }}>1 chance per user</div>
        </div>
      </div>
    </div>
  );
}

function Header({ c, small, theme }: { c: ColorScheme; small: boolean; theme: ThemeMode }) {
  return (
    <div style={{ background: c.bg, borderBottom: `1px solid ${c.border}`, padding: small ? "10px 14px" : "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ fontWeight: 800, fontSize: small ? 18 : 20, color: c.text, letterSpacing: -0.5 }}>ONAGUI</span>
      {!small && (
        <div style={{ display: "flex", gap: 22 }}>
          {["Home", "Giveaways", "Raffles", "Fundraise", "Marketplace", "Profiles"].map((item) => (
            <span key={item} style={{ fontSize: 13, fontWeight: 500, color: c.textSec, cursor: "pointer" }}>{item}</span>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: small ? 8 : 10, alignItems: "center" }}>
        <button style={{ padding: small ? "5px 12px" : "6px 16px", border: `1.5px solid ${c.border}`, borderRadius: 8, background: "transparent", color: c.text, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Sign In</button>
        <button style={{ padding: small ? "5px 12px" : "6px 16px", border: "none", borderRadius: 8, background: c.green, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>+ Create</button>
        {small && <span style={{ marginLeft: 2 }}>{Icons.menu(c.textSec)}</span>}
      </div>
    </div>
  );
}

function Hero({ c }: { c: ColorScheme }) {
  return (
    <div style={{ background: c.bg, padding: "40px 24px 32px", textAlign: "center" }}>
      <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 48, fontWeight: 800, color: c.text, margin: 0, letterSpacing: -1.5 }}>ONAGUI</h1>
      <p style={{ fontSize: 15, color: c.textSec, margin: "8px 0 18px", fontWeight: 400 }}>Your best chance to win</p>
      <div style={{ display: "flex", gap: 20, justifyContent: "center", paddingTop: 14, borderTop: `1px solid ${c.border}` }}>
        {["100% Secure", "Verified Winners", "Instant Payouts"].map((t) => (
          <span key={t} style={{ fontSize: 11, color: c.textMuted, display: "flex", alignItems: "center", gap: 4 }}>
            {Icons.shield(c.green)} {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function HeroMobile({ c }: { c: ColorScheme }) {
  return (
    <div style={{ background: c.bg, padding: "28px 16px 22px", textAlign: "center" }}>
      <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 34, fontWeight: 800, color: c.text, margin: 0, letterSpacing: -1 }}>ONAGUI</h1>
      <p style={{ fontSize: 13, color: c.textSec, margin: "6px 0 14px" }}>Your best chance to win</p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", paddingTop: 12, borderTop: `1px solid ${c.border}`, flexWrap: "wrap" }}>
        {["100% Secure", "Verified Winners", "Instant Payouts"].map((t) => (
          <span key={t} style={{ fontSize: 9, color: c.textMuted, display: "flex", alignItems: "center", gap: 3 }}>
            {Icons.shield(c.green)} {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function BottomNav({ c, theme }: { c: ColorScheme; theme: ThemeMode }) {
  const items = [
    { icon: Icons.home, label: "Home", active: true },
    { icon: Icons.gift, label: "Giveaways", active: false },
    { icon: Icons.plus, label: "Create", isCreate: true, active: false },
    { icon: Icons.heart, label: "Fundraise", active: false },
    { icon: Icons.user, label: "Profile", active: false },
  ];
  return (
    <div style={{ background: theme === "dark" ? "#0d1420" : "#fff", borderTop: `1px solid ${c.border}`, display: "flex", justifyContent: "space-around", alignItems: "center", padding: "6px 0 10px" }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, cursor: "pointer" }}>
          {item.isCreate ? (
            <div style={{ width: 40, height: 40, borderRadius: 12, background: c.green, display: "flex", alignItems: "center", justifyContent: "center", marginTop: -10, boxShadow: "0 4px 12px rgba(16,185,129,0.3)" }}>
              {item.icon("#fff")}
            </div>
          ) : (
            item.icon(item.active ? c.cyan : c.textMuted)
          )}
          <span style={{ fontSize: 9, fontWeight: item.active ? 600 : 500, color: item.active ? c.cyan : c.textMuted }}>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

const CARDS: GiveawayCardData[] = [
  { title: "iPhone 16 Pro Max", price: "1,299", host: "TechKing", highlight: "Hot Right Now" },
  { title: "PS5 Bundle", price: "699", host: "GamerzHub", highlight: "Ending Soon" },
  { title: "MacBook Air M3", price: "1,099", host: "AppleFan", highlight: "Most Entered" },
  { title: "$500 USDC Cash", price: "500", host: "CryptoKing", highlight: "Hot Right Now" },
];

export default function OnaguiRedesign({ page }: { page?: string }) {
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const c = C[theme];

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#060d16", minHeight: "100vh", padding: "16px" }}>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <h2 style={{ color: "#f8fafc", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Onagui.com — Style Preview v3</h2>
        <p style={{ color: "#64748b", fontSize: 11, marginBottom: 10 }}>No emojis. Proper icons. Smaller cards. MEXC-inspired.</p>
        <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
          {["dark", "light"].map((t) => (
            <button key={t} onClick={() => setTheme(t as ThemeMode)} style={{ padding: "6px 16px", borderRadius: 6, border: "none", background: theme === t ? "#22d3ee" : "#1e293b", color: theme === t ? "#0a1929" : "#94a3b8", fontWeight: 600, cursor: "pointer", fontSize: 11 }}>
              {t === "dark" ? "Dark" : "Light"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 24, justifyContent: "center", alignItems: "flex-start", flexWrap: "wrap" }}>
        <div>
          <div style={{ textAlign: "center", marginBottom: 4 }}>
            <span style={{ color: "#64748b", fontSize: 11, fontWeight: 600 }}>Desktop</span>
          </div>
          <div style={{ width: 740, background: c.bg, borderRadius: 10, overflow: "hidden", border: `2px solid ${theme === "dark" ? "#1e293b" : "#e2e8f0"}`, boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
            <div style={{ background: theme === "dark" ? "#152238" : "#f1f5f9", padding: "4px 10px", display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444" }} />
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b" }} />
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }} />
              <div style={{ marginLeft: 6, flex: 1, background: theme === "dark" ? "#0a1929" : "#fff", borderRadius: 3, padding: "2px 8px", fontSize: 9, color: c.textMuted }}>onagui.com</div>
            </div>

            <div style={{ maxHeight: 560, overflowY: "auto" }}>
              <Header c={c} small={false} theme={theme} />
              <Hero c={c} />

              <div style={{ padding: "16px 20px 24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: c.text, margin: 0 }}>Popular Giveaways</h2>
                  <span style={{ fontSize: 11, color: c.textSec, cursor: "pointer" }}>View More →</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                  {CARDS.map((card, i) => (
                    <GiveawayCard key={i} c={c} theme={theme} {...card} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div style={{ textAlign: "center", marginBottom: 4 }}>
            <span style={{ color: "#64748b", fontSize: 11, fontWeight: 600 }}>Mobile</span>
          </div>
          <div style={{ width: 300, background: c.bg, borderRadius: 28, overflow: "hidden", border: `3px solid ${theme === "dark" ? "#1e293b" : "#e2e8f0"}`, boxShadow: "0 20px 60px rgba(0,0,0,0.5)", position: "relative", display: "flex", flexDirection: "column" }}>
            <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 90, height: 20, background: theme === "dark" ? "#1e293b" : "#e2e8f0", borderRadius: "0 0 12px 12px", zIndex: 10 }} />

            <div style={{ flex: 1, maxHeight: 540, overflowY: "auto", paddingTop: 20 }}>
              <Header c={c} small={true} theme={theme} />
              <HeroMobile c={c} />

              <div style={{ padding: "12px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <h2 style={{ fontSize: 14, fontWeight: 700, color: c.text, margin: 0 }}>Popular Giveaways</h2>
                  <span style={{ fontSize: 10, color: c.textSec }}>View More →</span>
                </div>
                <div style={{ display: "grid", gap: 10 }}>
                  {CARDS.slice(0, 2).map((card, i) => (
                    <GiveawayCard key={i} c={c} theme={theme} {...card} />
                  ))}
                </div>
              </div>
            </div>

            <BottomNav c={c} theme={theme} />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 740, margin: "20px auto 0", padding: 14, background: "rgba(34,211,238,0.04)", borderRadius: 10, border: "1px solid rgba(34,211,238,0.1)" }}>
        <h3 style={{ color: "#22d3ee", fontSize: 12, fontWeight: 700, marginTop: 0, marginBottom: 6 }}>Changes from v2</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5, fontSize: 10, color: "#94a3b8" }}>
          <div>→ No emojis — SVG icons everywhere</div>
          <div>→ Hero: no buttons, just title + tagline</div>
          <div>→ Cards: 30% smaller info section</div>
          <div>→ Smaller font sizes throughout</div>
          <div>→ Sign In button</div>
          <div>→ Bottom nav: proper icons + labels</div>
          <div>→ Create button elevated in nav</div>
          <div>→ Light mode: MEXC-style clean white</div>
        </div>
      </div>

      {page ? null : null}
    </div>
  );
}
