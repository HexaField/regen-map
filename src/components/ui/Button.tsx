import React from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'ghost' | 'pill' | 'link'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({ className = '', variant = 'default', size = 'md', disabled, ...rest }: Props) {
  const base = 'inline-flex items-center justify-center rounded-md transition-colors'

  const sizes = {
    sm: 'h-7 px-3 text-[12px]',
    md: 'h-9 px-4 text-[13px]',
    lg: 'h-11 px-5 text-[14px]'
  }[size]

  const enabledVariants: Record<NonNullable<Props['variant']>, string> = {
  default: 'bg-neutral-800 text-white hover:bg-neutral-700 shadow-sm dark:bg-neutral-200 dark:text-neutral-900 dark:hover:bg-neutral-300',
  ghost: 'bg-white/70 hover:bg-white/90 border border-neutral-200 text-neutral-800 shadow-sm dark:bg-neutral-900/70 dark:hover:bg-neutral-900/90 dark:border-neutral-700 dark:text-neutral-200',
  pill: 'rounded-full bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200',
  link: 'bg-transparent text-neutral-600 hover:text-neutral-900 underline underline-offset-2 dark:text-neutral-300 dark:hover:text-neutral-50'
  }

  // Remove hover effects and gray out when disabled
  const disabledVariants: Record<NonNullable<Props['variant']>, string> = {
  default: 'bg-neutral-300 text-white/70 shadow-sm cursor-not-allowed pointer-events-none dark:bg-neutral-700 dark:text-neutral-300/70',
  ghost: 'bg-white/50 border border-neutral-200 text-neutral-400 shadow-sm cursor-not-allowed pointer-events-none dark:bg-neutral-900/40 dark:border-neutral-700 dark:text-neutral-600',
  pill: 'rounded-full bg-neutral-300 text-white/70 cursor-not-allowed pointer-events-none dark:bg-neutral-700 dark:text-neutral-300/70',
  link: 'bg-transparent text-neutral-400 underline underline-offset-2 cursor-not-allowed pointer-events-none dark:text-neutral-600'
  }

  const variantClasses = disabled ? disabledVariants[variant] : enabledVariants[variant]

  return (
    <button
      className={[base, sizes, variantClasses, disabled ? 'opacity-60' : '', className].join(' ')}
      disabled={disabled}
      {...rest}
    />
  )
}
