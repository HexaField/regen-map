import React from 'react'

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
