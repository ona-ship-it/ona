import React from 'react';

type Props = {
  label: string;
  icon?: string;
  color?: string; // tailwind bg color
};

export default function AchievementBadge({ label, icon, color }: Props) {
  const bg = color || 'bg-purple-700';
  return (
    <div
      className={`inline-flex items-center gap-2 ${bg} text-white px-3 py-1 rounded-md text-sm shadow-sm`}
    >
      {icon ? <span className="text-base leading-none">{icon}</span> : null}
      <span className="leading-none">{label}</span>
    </div>
  );
}