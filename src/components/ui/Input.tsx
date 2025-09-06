import React from 'react'

type Props = React.InputHTMLAttributes<HTMLInputElement> & { iconLeft?: React.ReactNode; iconRight?: React.ReactNode }

export function Input({ className = '', iconLeft, iconRight, ...props }: Props) {
  return (
    <div className={['relative', className].join(' ')}>
      {iconLeft ? <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">{iconLeft}</div> : null}
      <input
        className={[
          'w-full h-10 rounded-full bg-white/80 backdrop-blur-sm border border-neutral-200 pl-10 pr-10',
          'text-[14px] text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-300'
        ].join(' ')}
        {...props}
      />
      {iconRight ? <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">{iconRight}</div> : null}
    </div>
  )
}
