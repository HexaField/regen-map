import React from 'react'
import { useSimpleStore } from '@hexafield/simple-store/react'
import { LeftDockOpenState } from '../../state/LeftDockState'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900" id="app-shell">
      {/* Top nav */}
      {/* <div className="bg-white inset-x-0 top-0 z-40 h-14 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-700 rounded-full" />
        </div>
        <div className="text-[13px] text-neutral-500 flex gap-6">
          <a className="hover:text-neutral-700" href="#">
            About
          </a>
          <a className="hover:text-neutral-700" href="#">
            Resources
          </a>
          <a className="hover:text-neutral-700" href="#">
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
  return (
    <div
      className={[
        'fixed left-6 w-[320px] z-20 pointer-events-auto transition-all',
        open ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
      ].join(' ')}
      id="left-dock"
    >
      {children}
    </div>
  )
}

export function RightDock({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed right-6 z-20" id="right-dock">
      {children}
    </div>
  )
}
