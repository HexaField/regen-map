import React from 'react'

type Props = React.InputHTMLAttributes<HTMLInputElement> & { iconLeft?: React.ReactNode; iconRight?: React.ReactNode }

export function Input({ className = '', iconLeft, iconRight, ...props }: Props) {
  return (
    <div className={['relative', className].join(' ')}>
      {iconLeft ? (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500">
          {iconLeft}
        </div>
      ) : null}
      <input
        className={[
          'w-full h-10 rounded-full backdrop-blur-sm border pl-10 pr-10',
          'bg-white/80 border-neutral-200 text-[14px] text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-300',
          'dark:bg-neutral-900/60 dark:border-neutral-700 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:ring-neutral-700'
        ].join(' ')}
        {...props}
      />
      {iconRight ? (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500">
          {iconRight}
        </div>
      ) : null}
    </div>
  )
}
