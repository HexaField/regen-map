import { useSimpleStore } from '@hexafield/simple-store/react'
import React from 'react'

import { FocusedNodeState } from '../../state/GraphState'
import { closeLeftDock, LeftDockOpenState } from '../../state/LeftDockState'
import { DraggableResizableModal } from '../ui/DraggableResizableModal'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen bg-neutral-100 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100"
      id="app-shell"
    >
      {/* Top nav */}
      {/* <div className="bg-white dark:bg-neutral-900 inset-x-0 top-0 z-40 h-14 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-700 rounded-full" />
        </div>
        <div className="text-[13px] text-neutral-500 dark:text-neutral-400 flex gap-6">
          <a className="hover:text-neutral-700 dark:hover:text-neutral-200" href="#">
            About
          </a>
          <a className="hover:text-neutral-700 dark:hover:text-neutral-200" href="#">
            Resources
          </a>
          <a className="hover:text-neutral-700 dark:hover:text-neutral-200" href="#">
            Community
          </a>
        </div>
      </div> */}
      <div className="">{children}</div>
    </div>
  )
}

export function TopCenter({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed top-16 inset-x-0 z-30 flex justify-center" id="top-center">
      {children}
    </div>
  )
}

export function LeftDock({ children }: { children: React.ReactNode }) {
  const [open] = useSimpleStore(LeftDockOpenState)
  if (!open) return null
  return (
    <DraggableResizableModal
      title="Panels"
      initialWidth={360}
      initialHeight={520}
      initialX={24}
      initialY={112}
      minWidth={280}
      minHeight={240}
      onClose={closeLeftDock}
    >
      {children}
    </DraggableResizableModal>
  )
}

export function RightDock({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useSimpleStore(FocusedNodeState)
  if (!open.length) return null
  // Compute a sensible initial X so the panel starts near the right edge
  const initialWidth = 360
  const margin = 24
  const initialX = typeof window !== 'undefined' ? Math.max(margin, window.innerWidth - initialWidth - margin) : 960
  return (
    <DraggableResizableModal
      title="Node Information"
      initialWidth={initialWidth}
      initialHeight={600}
      initialX={initialX}
      initialY={112}
      minWidth={320}
      minHeight={260}
      onClose={() => setOpen([])}
    >
      {children}
    </DraggableResizableModal>
  )
}
