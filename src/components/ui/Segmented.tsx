import React from 'react'

type Item = { id: string; label: string }

export function Segmented({
  items,
  value,
  onChange,
  className = ''
}: {
  items: Item[]
  value: string
  onChange: (id: string) => void
  className?: string
}) {
  return (
    <div
      className={[
        'inline-flex rounded-full bg-white/80 backdrop-blur-sm border border-neutral-200 p-1 shadow-sm',
        className
      ].join(' ')}
    >
      {items.map((it) => (
        <button
          key={it.id}
          onClick={() => onChange(it.id)}
          className={[
            'px-3 h-8 rounded-full text-[12px] transition-colors',
            value === it.id ? 'bg-neutral-900 text-white' : 'text-neutral-700 hover:bg-neutral-100'
          ].join(' ')}
        >
          {it.label}
        </button>
      ))}
    </div>
  )
}
