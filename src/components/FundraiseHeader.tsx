'use client';

import Link from 'next/link';

export default function FundraiseHeader() {
  return (
    <header className="bg-[#0f0f23]/95 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-teal-500 rounded-lg flex items-center justify-center font-bold text-white text-xl">
            O
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-teal-500 bg-clip-text text-transparent">
            ONAGUI
          </h1>
        </Link>
        <Link
          href="/fundraise/create"
          className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 text-white px-6 py-2 rounded-lg font-semibold transition-all"
        >
          Start a Campaign
        </Link>
      </div>
    </header>
  );
}
