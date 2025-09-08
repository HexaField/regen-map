import React, { useEffect, useRef, useState } from 'react'

type Props = {
  title?: string
  initialWidth?: number
  initialHeight?: number
  initialX?: number
  initialY?: number
  minWidth?: number
  minHeight?: number
  onClose?: () => void
  children: React.ReactNode
  className?: string
}

export function DraggableResizableModal({
  title = 'Modal',
  initialWidth = 360,
  initialHeight = 420,
  initialX = 80,
  initialY = 120,
  minWidth = 280,
  minHeight = 200,
  onClose,
  children,
  className = ''
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [pos, setPos] = useState({ x: initialX, y: initialY })
  const [size, setSize] = useState({ w: initialWidth, h: initialHeight })
  const [dragging, setDragging] = useState(false)
  const [resizing, setResizing] = useState(false)
  const dragOffsetRef = useRef({ x: 0, y: 0 })
  const [isMobile, setIsMobile] = useState(false)

  // Detect Tailwind's "sm" breakpoint (mobile < 640px)
  useEffect(() => {
    if (typeof window === 'undefined' || !('matchMedia' in window)) return
    const mq = window.matchMedia('(max-width: 639px)')
    const apply = () => setIsMobile(mq.matches)
    apply()
    const listener = () => apply()
    if ('addEventListener' in mq) {
      mq.addEventListener('change', listener)
      return () => mq.removeEventListener('change', listener)
    } else {
      // Deprecated fallback for older browsers
      // @ts-ignore - addListener is deprecated but still present in some engines
      mq.addListener(listener)
      return () => {
        // @ts-ignore - removeListener is deprecated but still present in some engines
        mq.removeListener(listener)
      }
    }
  }, [])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (isMobile) return // disable drag/resize on mobile
      if (dragging) {
        setPos({ x: e.clientX - dragOffsetRef.current.x, y: e.clientY - dragOffsetRef.current.y })
      } else if (resizing) {
        const rect = containerRef.current?.getBoundingClientRect()
        if (!rect) return
        const newW = Math.max(minWidth, e.clientX - rect.left)
        const newH = Math.max(minHeight, e.clientY - rect.top)
        setSize({ w: newW, h: newH })
      }
    }
    const onUp = () => {
      setDragging(false)
      setResizing(false)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [dragging, resizing, minWidth, minHeight, isMobile])

  const onHeaderMouseDown = (e: React.MouseEvent) => {
    if (isMobile) return // no dragging on mobile
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    setDragging(true)
    dragOffsetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const onResizeMouseDown = (e: React.MouseEvent) => {
    if (isMobile) return // no resizing on mobile
    e.stopPropagation()
    setResizing(true)
  }

  return (
    <div
      ref={containerRef}
      className={[
        'fixed z-40 rounded-xl backdrop-blur border shadow-lg select-none',
        'bg-white/90 border-neutral-200',
        'dark:bg-neutral-900/80 dark:border-neutral-700',
        'will-change-transform',
        isMobile ? 'inset-3' : '',
        className
      ].join(' ')}
      style={isMobile ? undefined : { left: pos.x, top: pos.y, width: size.w, height: size.h }}
    >
      <div
        className={[
          'rounded-t-xl px-3 py-2 border-b flex items-center justify-between',
          'bg-white/70 border-neutral-200',
          'dark:bg-neutral-900/70 dark:border-neutral-700',
          isMobile ? 'cursor-default' : 'cursor-move'
        ].join(' ')}
        onMouseDown={onHeaderMouseDown}
      >
        <div className="text-[13px] font-medium text-neutral-800 dark:text-neutral-200">{title}</div>
        {onClose ? (
          <button
            className="text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 text-[13px] h-6 w-6 inline-flex items-center justify-center rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
            onClick={onClose}
          >
            ✕
          </button>
        ) : null}
      </div>
      <div className="p-3 overflow-auto" style={isMobile ? { height: 'calc(100% - 40px)' } : { height: size.h - 40 }}>
        {children}
      </div>
      {/* Resize handle */}
      {isMobile ? null : (
        <div
          className="absolute right-0 bottom-0 w-4 h-4 cursor-se-resize"
          onMouseDown={onResizeMouseDown}
          style={{
            background: 'linear-gradient(135deg, transparent 0 50%, rgba(0,0,0,0.08) 50% 100%)',
            borderBottomRightRadius: 12
          }}
          aria-label="Resize"
        />
      )}
    </div>
  )
}
