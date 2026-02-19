"use client";

import { useState } from "react";

const COLORS = {
  dark: {
    bgPrimary: "#0a1929",
    bgSecondary: "#1e293b",
    textPrimary: "#f8fafc",
    textSecondary: "#94a3b8",
    textTertiary: "#64748b",
    border: "rgba(255,255,255,0.1)",
    cyan: "#22d3ee",
    green: "#10b981",
  },
  light: {
    bgPrimary: "#ffffff",
    bgSecondary: "#f8fafc",
    textPrimary: "#0f172a",
    textSecondary: "#64748b",
    textTertiary: "#94a3b8",
    border: "#e2e8f0",
    cyan: "#22d3ee",
    green: "#10b981",
  },
};

function BcGameCard({ type = "GIVEAWAY", title, price, host, highlight, small }: { type?: string; title: string; price: string; host?: string; highlight?: string; small?: boolean }) {
  const [hovered, setHovered] = useState(false);

  const images: Record<string, string> = {
    GIVEAWAY: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
    RAFFLE: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    MARKETPLACE: "linear-gradient(135deg, #1b1b2f 0%, #162447 50%, #1f4068 100%)",
    PROFILE: "linear-gradient(135deg, #0d1117 0%, #161b22 50%, #21262d 100%)",
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "linear-gradient(135deg, rgba(20,26,32,0.8) 0%, rgba(15,20,25,0.9) 100%)",
        border: `1px solid ${hovered ? "rgba(0,212,212,0.5)" : "rgba(0,212,212,0.15)"}`,
        borderRadius: 20,
        overflow: "hidden",
        transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        position: "relative",
        backdropFilter: "blur(10px)",
        cursor: "pointer",
        transform: hovered ? "translateY(-8px)" : "translateY(0)",
        boxShadow: hovered
          ? "0 20px 60px rgba(0,212,212,0.2), 0 0 40px rgba(0,212,212,0.1)"
          : "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "linear-gradient(135deg, rgba(0,212,212,0.1) 0%, transparent 50%)",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.3s ease",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      <div style={{ position: "relative", width: "100%", height: small ? 130 : 220, overflow: "hidden" }}>
        <div
          style={{
            width: "100%",
            height: "100%",
            background: images[type] || images.GIVEAWAY,
            transition: "transform 0.5s ease",
            transform: hovered ? "scale(1.1)" : "scale(1)",
          }}
        />

        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "60%",
            background: "linear-gradient(to top, rgba(15,20,25,0.95) 0%, transparent 100%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 16,
            left: 16,
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "linear-gradient(135deg, #ff4400 0%, #ff8800 100%)",
            color: "#fff",
            padding: "6px 14px",
            borderRadius: 20,
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: small ? 10 : 12,
            fontWeight: 700,
            letterSpacing: 1,
            zIndex: 2,
            boxShadow: "0 4px 15px rgba(255,68,0,0.4)",
          }}
        >
          <span style={{ fontSize: small ? 10 : 14 }}>📈</span>
          <span>TRENDING</span>
        </div>

        <div
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            width: 36,
            height: 36,
            background: "rgba(15,20,25,0.8)",
            border: "2px solid #3b82f6",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2,
            backdropFilter: "blur(10px)",
            boxShadow: "0 0 20px rgba(0,212,212,0.5)",
          }}
        >
          <span style={{ color: "#00d4d4", fontSize: 16 }}>✓</span>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 16,
            left: 16,
            background: "rgba(255,136,0,0.9)",
            color: "#0f1419",
            padding: "6px 14px",
            borderRadius: 8,
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: small ? 10 : 12,
            fontWeight: 700,
            letterSpacing: 1,
            zIndex: 2,
            textTransform: "uppercase",
            boxShadow: "0 4px 15px rgba(255,136,0,0.3)",
          }}
        >
          {type}
        </div>
      </div>

      <div style={{ padding: small ? 14 : 24 }}>
        <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(255,136,0,0.1)",
              border: "1px solid rgba(255,136,0,0.3)",
              padding: "6px 12px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              color: "#ff8800",
            }}
          >
            <span>⭐</span>
            <span>4.{Math.floor(Math.random() * 9)}</span>
            <span style={{ color: "#718096", fontSize: 11 }}>({50 + Math.floor(Math.random() * 200)})</span>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <span style={{ color: "#718096", fontSize: 16, cursor: "pointer" }}>♡</span>
            <span style={{ color: "#718096", fontSize: 16, cursor: "pointer" }}>🔖</span>
          </div>
        </div>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 10px",
            borderRadius: 999,
            background: "rgba(0,212,212,0.12)",
            color: "#3b82f6",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: 0.4,
            marginBottom: 12,
          }}
        >
          {highlight || "Hot Right Now"}
        </div>

        {type !== "PROFILE" && (
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 8 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                  border: "2px solid rgba(0,212,212,0.4)",
                }}
              />
              <span style={{ fontSize: 10, fontWeight: 700, color: "#3b82f6", textTransform: "uppercase", letterSpacing: 0.6 }}>
                12 subs
              </span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3
                style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: small ? 18 : 22,
                  fontWeight: 700,
                  color: "#ffffff",
                  marginBottom: 6,
                  lineHeight: 1.3,
                  letterSpacing: 0.5,
                  margin: 0,
                }}
              >
                {title}
              </h3>
              <p style={{ fontSize: 14, color: "#718096", marginBottom: 0, fontWeight: 500, margin: 0 }}>
                Exclusive {type.toLowerCase()}...
              </p>
            </div>
          </div>
        )}

        {type === "PROFILE" && (
          <div>
            <h3
              style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: small ? 18 : 22,
                fontWeight: 700,
                color: "#ffffff",
                margin: "0 0 6px 0",
              }}
            >
              {title}
            </h3>
            <p style={{ fontSize: 14, color: "#718096", margin: "0 0 12px 0" }}>@{title.toLowerCase().replace(/\s/g, "")}</p>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20, fontSize: 13, color: "#718096" }}>
          <span>by</span>
          <span style={{ color: "#3b82f6", fontWeight: 600 }}>{host || "ONAGUI"}</span>
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "baseline", fontFamily: "'Rajdhani', sans-serif", gap: 2 }}>
            <span style={{ fontSize: small ? 20 : 24, color: "#ff8800", fontWeight: 600 }}>$</span>
            <span style={{ fontSize: small ? 32 : 40, fontWeight: 700, color: "#ff8800" }}>{price}</span>
          </div>
        </div>

        {type === "GIVEAWAY" && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
              fontSize: 12,
              color: "#94a3b8",
            }}
          >
            <span>Prize boost</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, color: "#3b82f6" }}>
              <span>${price}</span>
              <span style={{ color: "#718096" }}>→</span>
              <span>${(parseInt(price.replace(/,/g, ""), 10) * 1.4).toLocaleString()}</span>
            </div>
          </div>
        )}

        {type === "PROFILE" && (
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 12, color: "#718096", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Followers</div>
              <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 18, fontWeight: 700, color: "#ffffff" }}>125.4K</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#718096", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Total entries</div>
              <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 18, fontWeight: 700, color: "#ffffff" }}>89,231</div>
            </div>
          </div>
        )}

        <div style={{ display: "grid", gap: "0.5rem" }}>
          <button
            style={{
              position: "relative",
              width: "100%",
              padding: "12px 24px",
              border: "none",
              borderRadius: 10,
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: small ? 12 : 14,
              fontWeight: 700,
              letterSpacing: 1.5,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              overflow: "hidden",
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              color: "#ffffff",
              boxShadow: "0 4px 20px rgba(16,185,129,0.3)",
            }}
          >
            {type === "PROFILE"
              ? "VIEW PROFILE"
              : type === "MARKETPLACE"
                ? "🛒 BUY NOW"
                : type === "RAFFLE"
                  ? "🎟️ BUY TICKET — 1 USDT"
                  : "🛒 CLAIM FREE TICKET"}
          </button>

          {type === "GIVEAWAY" && (
            <>
              <button
                style={{
                  width: "100%",
                  border: "1px solid rgba(0,212,212,0.5)",
                  borderRadius: 10,
                  padding: "10px 16px",
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: 1,
                  background: "rgba(0,212,212,0.08)",
                  color: "#3b82f6",
                  cursor: "pointer",
                }}
              >
                BUY TICKET 1 USDC
              </button>
              <div style={{ fontSize: 12, color: "#718096", textAlign: "center", letterSpacing: 0.4 }}>
                1 chance per user
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Header({ c, small }: { c: (typeof COLORS)["dark"]; small: boolean }) {
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  const createItems = [
    { label: "Giveaway", href: "/create-giveaway" },
    { label: "Raffle", href: "/raffles/create" },
    { label: "Fundraise", href: "/fundraise/create" },
    { label: "Marketplace", href: "/marketplace" },
    { label: "Profile", href: "/profile" },
  ];

  return (
    <div style={{ background: c.bgPrimary, borderBottom: `1px solid ${c.border}`, padding: small ? "10px 12px" : "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ fontWeight: 800, fontSize: small ? 16 : 20, color: c.textPrimary }}>ONAGUI</span>
      {!small && (
        <div style={{ display: "flex", gap: 20 }}>
          {["Home", "Giveaways", "Raffles", "Fundraise", "Marketplace", "Profiles"].map((item) => (
            <span key={item} style={{ fontSize: 13, fontWeight: 500, color: c.textSecondary, cursor: "pointer" }}>{item}</span>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: small ? 6 : 10, alignItems: "center" }}>
        {!small && (
          <button style={{ padding: "6px 14px", border: `1.5px solid ${c.border}`, borderRadius: 8, background: "transparent", color: c.textPrimary, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Sign Up</button>
        )}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowCreateMenu((value) => !value)}
            style={{ padding: small ? "5px 10px" : "6px 14px", border: "none", borderRadius: 8, background: c.green, color: "#fff", fontSize: small ? 11 : 12, fontWeight: 600, cursor: "pointer" }}
          >
            + Create
          </button>

          {showCreateMenu && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                minWidth: small ? 160 : 180,
                background: c.bgSecondary,
                border: `1px solid ${c.border}`,
                borderRadius: 10,
                overflow: "hidden",
                boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
                zIndex: 100,
              }}
            >
              {createItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setShowCreateMenu(false)}
                  style={{
                    display: "block",
                    padding: "10px 12px",
                    color: c.textPrimary,
                    textDecoration: "none",
                    fontSize: 13,
                    fontWeight: 600,
                    borderBottom: `1px solid ${c.border}`,
                  }}
                >
                  Create {item.label}
                </a>
              ))}
            </div>
          )}
        </div>
        {small && <span style={{ fontSize: 18, color: c.textSecondary }}>☰</span>}
      </div>
    </div>
  );
}

function Hero({ c, small }: { c: (typeof COLORS)["dark"]; small: boolean }) {
  return (
    <div style={{ background: c.bgPrimary, padding: small ? "28px 16px" : "48px 24px", textAlign: "center" }}>
      <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: small ? 32 : 52, fontWeight: 800, color: c.textPrimary, margin: 0, letterSpacing: -1 }}>ONAGUI</h1>
      <p style={{ fontSize: small ? 13 : 17, color: c.textSecondary, margin: "10px auto 18px", maxWidth: 400 }}>Your best chance to win</p>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
        <button style={{ padding: small ? "9px 18px" : "11px 26px", border: "none", borderRadius: 8, background: c.green, color: "#fff", fontWeight: 600, fontSize: small ? 12 : 14, cursor: "pointer" }}>Browse Giveaways →</button>
        <button style={{ padding: small ? "9px 18px" : "11px 26px", border: `2px solid ${c.border}`, borderRadius: 8, background: "transparent", color: c.textPrimary, fontWeight: 600, fontSize: small ? 12 : 14, cursor: "pointer" }}>View Raffles</button>
      </div>
      <div style={{ display: "flex", gap: small ? 10 : 24, justifyContent: "center", marginTop: 20, paddingTop: 16, borderTop: `1px solid ${c.border}`, flexWrap: "wrap" }}>
        {["100% Secure", "Verified Winners", "Instant Payouts"].map((t) => (
          <span key={t} style={{ fontSize: small ? 10 : 12, color: c.textTertiary, display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ color: c.green }}>✓</span> {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function BottomNav({ c }: { c: (typeof COLORS)["dark"] }) {
  return (
    <div style={{ background: c.bgSecondary, borderTop: `1px solid ${c.border}`, display: "flex", justifyContent: "space-around", padding: "8px 0 12px" }}>
      {["🏠", "🎁", "🎟️", "💝", "👤"].map((icon, i) => (
        <span key={i} style={{ fontSize: 18, color: i === 0 ? c.cyan : c.textTertiary, cursor: "pointer" }}>{icon}</span>
      ))}
    </div>
  );
}

const CARDS_DATA = [
  { type: "GIVEAWAY", title: "iPhone 16 Pro Max", price: "1,299", host: "TechKing", highlight: "Hot Right Now" },
  { type: "GIVEAWAY", title: "PS5 Bundle + Games", price: "699", host: "GamerzHub", highlight: "Ending Soon" },
  { type: "GIVEAWAY", title: "MacBook Air M3", price: "1,099", host: "AppleFan", highlight: "Most Entered" },
  { type: "GIVEAWAY", title: "$500 USDC Cash", price: "500", host: "CryptoKing", highlight: "Hot Right Now" },
];

const RAFFLE_DATA = [
  { type: "RAFFLE", title: "Rolex Submariner", price: "12,500", host: "ONAGUI", highlight: "Almost Sold Out" },
  { type: "RAFFLE", title: "Tesla Model 3", price: "35,000", host: "ONAGUI", highlight: "Popular Raffle" },
  { type: "RAFFLE", title: "Bored Ape NFT", price: "8,200", host: "ONAGUI", highlight: "New Raffle" },
  { type: "RAFFLE", title: "Trip to Dubai", price: "4,500", host: "ONAGUI", highlight: "Popular Raffle" },
];

export default function OnaguiPreviewPage() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const c = COLORS[theme];

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#0a0e13", minHeight: "100vh", padding: "20px" }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <h2 style={{ color: "#f8fafc", fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Onagui.com — Redesign Preview</h2>
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          {["dark", "light"].map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t as "dark" | "light")}
              style={{
                padding: "7px 18px",
                borderRadius: 8,
                border: "none",
                background: theme === t ? "#22d3ee" : "#334155",
                color: theme === t ? "#0a1929" : "#94a3b8",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              {t === "dark" ? "🌙 Dark" : "☀️ Light"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 28, justifyContent: "center", alignItems: "flex-start", flexWrap: "wrap" }}>
        <div>
          <div style={{ textAlign: "center", marginBottom: 6 }}>
            <span style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600 }}>💻 Desktop</span>
          </div>
          <div style={{ width: 720, background: c.bgPrimary, borderRadius: 12, overflow: "hidden", border: `2px solid ${theme === "dark" ? "#334155" : "#e2e8f0"}`, boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
            <div style={{ background: theme === "dark" ? "#1e293b" : "#f1f5f9", padding: "5px 10px", display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#ef4444" }} />
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#f59e0b" }} />
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981" }} />
              <div style={{ marginLeft: 6, flex: 1, background: theme === "dark" ? "#0a1929" : "#fff", borderRadius: 4, padding: "2px 8px", fontSize: 9, color: c.textSecondary }}>onagui.com</div>
            </div>

            <div style={{ maxHeight: 600, overflowY: "auto" }}>
              <Header c={c} small={false} />
              <Hero c={c} small={false} />

              <div style={{ padding: "20px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: c.textPrimary, margin: 0 }}>Popular Giveaways</h2>
                  <span style={{ fontSize: 12, color: c.textSecondary, cursor: "pointer" }}>View More →</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                  {CARDS_DATA.map((card, i) => (
                    <BcGameCard key={i} {...card} small={true} />
                  ))}
                </div>
              </div>

              <div style={{ padding: "0 20px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: c.textPrimary, margin: 0 }}>Popular Raffles</h2>
                  <span style={{ fontSize: 12, color: c.textSecondary, cursor: "pointer" }}>View More →</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                  {RAFFLE_DATA.map((card, i) => (
                    <BcGameCard key={i} {...card} small={true} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div style={{ textAlign: "center", marginBottom: 6 }}>
            <span style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600 }}>📱 Mobile</span>
          </div>
          <div style={{ width: 300, background: c.bgPrimary, borderRadius: 28, overflow: "hidden", border: `3px solid ${theme === "dark" ? "#334155" : "#e2e8f0"}`, boxShadow: "0 20px 60px rgba(0,0,0,0.5)", position: "relative" }}>
            <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 100, height: 22, background: theme === "dark" ? "#334155" : "#e2e8f0", borderRadius: "0 0 14px 14px", zIndex: 10 }} />

            <div style={{ maxHeight: 580, overflowY: "auto", paddingTop: 22 }}>
              <Header c={c} small={true} />
              <Hero c={c} small={true} />

              <div style={{ padding: "14px 12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <h2 style={{ fontSize: 15, fontWeight: 700, color: c.textPrimary, margin: 0 }}>Popular Giveaways</h2>
                  <span style={{ fontSize: 10, color: c.textSecondary }}>View More →</span>
                </div>
                <div style={{ display: "grid", gap: 12 }}>
                  {CARDS_DATA.slice(0, 2).map((card, i) => (
                    <BcGameCard key={i} {...card} small={false} />
                  ))}
                </div>
              </div>
            </div>

            <BottomNav c={c} />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "24px auto 0", padding: 16, background: "rgba(34,211,238,0.05)", borderRadius: 12, border: "1px solid rgba(34,211,238,0.15)" }}>
        <h3 style={{ color: "#22d3ee", fontSize: 13, fontWeight: 700, marginTop: 0, marginBottom: 6 }}>What's New</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 11, color: "#94a3b8" }}>
          <div>✅ Cards: 100% your exact design</div>
          <div>✅ Orange trending badge + verified icon</div>
          <div>✅ Blue gradient action button with glow</div>
          <div>✅ Rating row with star + count</div>
          <div>✅ Prize boost progression row</div>
          <div>✅ Secondary "BUY TICKET 1 USDC" button</div>
          <div>✅ Clean hero — no animated effects</div>
          <div>✅ Grey nav → cyan hover</div>
          <div>✅ Green CTA buttons</div>
          <div>✅ Unified background everywhere</div>
        </div>
      </div>
    </div>
  );
}
