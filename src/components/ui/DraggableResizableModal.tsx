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

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
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
  }, [dragging, resizing, minWidth, minHeight])

  const onHeaderMouseDown = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    setDragging(true)
    dragOffsetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const onResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    setResizing(true)
  }

  return (
    <div
      ref={containerRef}
      className={[
        'fixed z-40 rounded-xl bg-white/90 backdrop-blur border border-neutral-200 shadow-lg select-none',
        'will-change-transform',
        className
      ].join(' ')}
      style={{ left: pos.x, top: pos.y, width: size.w, height: size.h }}
    >
      <div
        className="cursor-move rounded-t-xl bg-white/70 px-3 py-2 border-b border-neutral-200 flex items-center justify-between"
        onMouseDown={onHeaderMouseDown}
      >
        <div className="text-[13px] font-medium text-neutral-800">{title}</div>
        {onClose ? (
          <button
            className="text-neutral-500 hover:text-neutral-800 text-[13px] h-6 w-6 inline-flex items-center justify-center rounded-md hover:bg-neutral-100"
            onClick={onClose}
          >
            ✕
          </button>
        ) : null}
      </div>
      <div className="p-3 overflow-auto" style={{ height: size.h - 40 }}>
        {children}
      </div>
      {/* Resize handle */}
      <div
        className="absolute right-0 bottom-0 w-4 h-4 cursor-se-resize"
        onMouseDown={onResizeMouseDown}
        style={{
          background:
            'linear-gradient(135deg, transparent 0 50%, rgba(0,0,0,0.08) 50% 100%)',
          borderBottomRightRadius: 12
        }}
        aria-label="Resize"
      />
    </div>
  )
}
