"use client";
import React from "react";

type Props = {
  size?: number; // px
  className?: string;
  title?: string;
  primaryColor?: string;
  secondaryColor?: string;
  strokeColor?: string;
  ariaHidden?: boolean;
};

export default function OnaguiSymbol({
  size = 48,
  className = "",
  title = "Onagui symbol",
  primaryColor = "#8b5cf6", // purple-400-ish
  secondaryColor = "#06b6d4", // teal/cyan-ish
  strokeColor = "#2a2a2a",
  ariaHidden = false,
}: Props) {
  const viewBox = "0 0 120 140";
  return (
    <svg
      role={ariaHidden ? "img" : "img"}
      aria-hidden={ariaHidden}
      aria-label={ariaHidden ? undefined : title}
      className={className}
      width={size}
      height={(size * Number(viewBox.split(" ")[3])) / Number(viewBox.split(" ")[2])} // keep aspect
      viewBox={viewBox}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="g1" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor={primaryColor} stopOpacity="1" />
          <stop offset="50%" stopColor="#c084fc" stopOpacity="0.95" />
          <stop offset="100%" stopColor={secondaryColor} stopOpacity="1" />
        </linearGradient>

        <linearGradient id="g2" x1="0" x2="1" y1="0" y2="0.8">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.12" />
        </linearGradient>

        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <mask id="shine">
          <rect x="0" y="0" width="120" height="140" fill="white" />
          <path
            d="M20 18 L60 6 L100 18 L60 58 L20 18 Z"
            fill="black"
            transform="translate(-5,-4)"
            opacity="0.18"
          />
        </mask>

        <style>{`
          .onagui-rotate { transform-origin: 50% 50%; animation: float 6s ease-in-out infinite; }
          .onagui-shine { animation: shine 3.8s linear infinite; }
          @keyframes float {
            0% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-2px) rotate(1deg); }
            100% { transform: translateY(0) rotate(0deg); }
          }
          @keyframes shine {
            0% { opacity: 0.25; transform: translateX(-6px); }
            50% { opacity: 0.6; transform: translateX(6px); }
            100% { opacity: 0.25; transform: translateX(-6px); }
          }
        `}</style>
      </defs>

      {/* soft outer glow */}
      <g filter="url(#glow)" className="onagui-rotate">
        <path
          d="M60 8 L104 24 L104 58 L60 124 L16 58 L16 24 Z"
          fill="url(#g1)"
          stroke={strokeColor}
          strokeOpacity="0.12"
          strokeWidth="1.5"
          opacity="0.98"
        />
      </g>

      {/* faceted inner geometry */}
      <g filter="url(#soft)" transform="translate(0,2)">
        {/* top facet */}
        <path
          d="M60 12 L92 26 L60 46 L28 26 Z"
          fill="url(#g2)"
          opacity="0.95"
        />
        {/* left vertical facets */}
        <path
          d="M28 28 L44 56 L44 98 L28 76 Z"
          fill="#6b21a8"
          opacity="0.95"
        />
        <path
          d="M44 56 L60 76 L60 118 L44 98 Z"
          fill="#7c3aed"
          opacity="0.9"
        />
        {/* right vertical facets */}
        <path
          d="M92 28 L76 56 L76 98 L92 76 Z"
          fill="#0891b2"
          opacity="0.9"
        />
        <path
          d="M60 76 L76 56 L60 46 L44 56 Z"
          fill="#c084fc"
          opacity="0.92"
        />
        {/* bottom facets */}
        <path
          d="M60 46 L92 26 L104 58 L60 124 Z"
          fill="rgba(255,255,255,0.02)"
          opacity="0.7"
        />
      </g>

      {/* center transparent core */}
      <polygon
        points="60,48 72,62 60,88 48,62"
        fill="rgba(255,255,255,0.06)"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="0.6"
      />

      {/* subtle animated shine */}
      <rect
        x="12"
        y="8"
        width="96"
        height="48"
        fill="url(#g2)"
        mask="url(#shine)"
        className="onagui-shine"
        opacity="0.35"
      />

      {/* outline */}
      <path
        d="M60 8 L104 24 L104 58 L60 124 L16 58 L16 24 Z"
        fill="none"
        stroke="rgba(0,0,0,0.18)"
        strokeWidth="1.2"
      />
    </svg>
  );
}