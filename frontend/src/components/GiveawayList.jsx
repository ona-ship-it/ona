import React from 'react';

export default function GiveawayList({ giveaways = [] }) {
  if (!giveaways.length) {
    return (
      <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6 text-neutral-300">
        No giveaways yet. Create one to get started.
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
      {giveaways.map((g) => (
        <div key={g.id} className="rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900">
          <div className="h-28 bg-neutral-800" aria-hidden />
          <div className="p-4">
            <div className="flex items-start justify-between">
              <h3 className="font-medium line-clamp-2">{g.title}</h3>
              <span className="text-xs text-neutral-400 capitalize">{g.status || 'draft'}</span>
            </div>
            <div className="mt-2 text-sm text-neutral-300 line-clamp-3">{g.description}</div>
            <div className="mt-3 flex items-center gap-2">
              <button className="rounded-lg bg-neutral-800 px-3 py-1 text-xs hover:bg-neutral-700">Details</button>
              <button className="rounded-lg bg-indigo-600 px-3 py-1 text-xs hover:bg-indigo-500">Enter</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}