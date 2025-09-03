import React from 'react'

type Tab = { id: string; label: string }

export function Tabs({ tabs, value, onChange }: { tabs: Tab[]; value: string; onChange: (id: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={[
            'px-3 h-8 rounded-full text-[12px] transition-colors',
            value === t.id ? 'bg-neutral-900 text-white' : 'bg-white/60 text-neutral-700 hover:bg-white'
          ].join(' ')}
        >
          {t.label}
        </button>
      ))}
      <div className="ml-1 text-neutral-400">•</div>
    </div>
  )
}
