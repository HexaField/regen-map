import React, { useState } from 'react'

import { closeGraphConfigModal, toggleGraphConfigModal } from '../../state/GraphConfigModalState'
import { closeFocusedNode } from '../../state/GraphState'
import { closeLeftDock, toggleLeftDock } from '../../state/LeftDockState'
import { Button } from '../ui/Button'
import { GitHubIcon } from '../ui/GitHubIcon'

export function MobileActions() {
  const [open, setOpen] = useState(false)

  // On mobile, ensure only one menu/panel is open at a time by closing others first
  const actions = [
    {
      label: 'Graph Settings',
      onClick: () => {
        // close others
        closeLeftDock()
        closeFocusedNode()
        // then toggle selected
        toggleGraphConfigModal()
      }
    },
    // Theme moved into Graph Settings
    // {
    //   label: 'Panels',
    //   onClick: () => {
    //     closeGraphConfigModal()
    //     closeFocusedNode()
    //     toggleLeftDock()
    //   }
    // },
    {
      label: 'Node Information',
      onClick: () => {
        closeGraphConfigModal()
        closeLeftDock()
      }
    }
  ]

  return (
    <div className="sm:hidden">
      {/* GitHub link in bottom left corner for mobile */}
      <div className="fixed bottom-4 left-4 z-40">
        <a
          href="https://github.com/HexaField/regen-map"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-12 h-12 bg-white/95 dark:bg-neutral-800/95 backdrop-blur rounded-full shadow-lg hover:shadow-xl transition-shadow border border-neutral-200 dark:border-neutral-700"
          aria-label="View on GitHub"
        >
          <GitHubIcon size={20} className="text-neutral-700 dark:text-neutral-300" />
        </a>
      </div>

      {/* Toggle button (FAB) */}
      <div className="fixed top-4 right-4 z-40">
        <Button
          aria-label={open ? 'Close menu' : 'Open menu'}
          variant="pill"
          size="lg"
          className="shadow-lg"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? 'Close' : 'Menu'}
        </Button>
      </div>

      {/* Overlay */}
      {open ? (
        <button
          aria-label="Dismiss menu"
          className="fixed inset-0 z-30 bg-black/20"
          onClick={() => setOpen((v) => !v)}
        />
      ) : null}

      {/* Action sheet */}
      <div
        className={[
          'fixed top-20 right-4 z-40 w-[220px] rounded-xl border border-neutral-200 bg-white/95 backdrop-blur shadow-xl transition-all',
          open ? 'opacity-100 translate-y-0' : 'pointer-events-none opacity-0 translate-y-2'
        ].join(' ')}
        role="menu"
        aria-hidden={!open}
      >
        <div className="p-2">
          {actions.map((a) => (
            <button
              key={a.label}
              className="w-full text-left text-[13px] px-3 py-2 rounded-lg hover:bg-neutral-100 text-neutral-800"
              onClick={() => {
                a.onClick()
                setOpen((v) => !v)
              }}
              role="menuitem"
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
