import React from 'react'

export function Card({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={[
        'rounded-xl backdrop-blur-sm border shadow-sm',
        'bg-white/80 border-neutral-200',
        'dark:bg-neutral-900/70 dark:border-neutral-700',
        className
      ].join(' ')}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <div className={['px-4 pt-4 pb-2', className].join(' ')}>{children}</div>
}

export function CardContent({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <div className={['px-4 pb-4', className].join(' ')}>{children}</div>
}
