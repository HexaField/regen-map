import React from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'ghost' | 'pill' | 'link'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({ className = '', variant = 'default', size = 'md', ...props }: Props) {
  const base = 'inline-flex items-center justify-center rounded-md transition-colors'
  const sizes = {
    sm: 'h-7 px-3 text-[12px]',
    md: 'h-9 px-4 text-[13px]',
    lg: 'h-11 px-5 text-[14px]'
  }[size]

  const variants = {
    default: 'bg-neutral-800 text-white hover:bg-neutral-700 shadow-sm',
    ghost: 'bg-white/70 hover:bg-white/90 border border-neutral-200 text-neutral-800 shadow-sm',
    pill: 'rounded-full bg-neutral-900 text-white hover:bg-neutral-800',
    link: 'bg-transparent text-neutral-600 hover:text-neutral-900 underline underline-offset-2'
  }[variant]

  return <button className={[base, sizes, variants, className].join(' ')} {...props} />
}
