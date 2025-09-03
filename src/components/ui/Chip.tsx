import React from 'react'

export function Chip({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full bg-neutral-900 text-white text-[12px] h-7 px-3',
        className
      ].join(' ')}
    >
      {children}
    </span>
  )
}
