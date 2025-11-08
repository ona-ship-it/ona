'use client';

import React from 'react';

export default function AuditLogButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title="Open audit log"
      className="inline-flex items-center gap-2 px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
      <span>Audit</span>
    </button>
  );
}