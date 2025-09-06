import React, { useState } from 'react'

import { closeGraphConfigModal, toggleGraphConfigModal } from '../../state/GraphConfigModalState'
import { closeLeftDock, toggleLeftDock } from '../../state/LeftDockState'
import { closeNodePanel, toggleNodePanel } from '../../state/NodePanelState'
import { Button } from '../ui/Button'

export function MobileActions() {
  const [open, setOpen] = useState(false)

  // On mobile, ensure only one menu/panel is open at a time by closing others first
  const actions = [
    {
      label: 'Graph Settings',
      onClick: () => {
        // close others
        closeLeftDock()
        closeNodePanel()
        // then toggle selected
        toggleGraphConfigModal()
      }
    },
    {
      label: 'Panels',
      onClick: () => {
        closeGraphConfigModal()
        closeNodePanel()
        toggleLeftDock()
      }
    },
    {
      label: 'Node Information',
      onClick: () => {
        closeGraphConfigModal()
        closeLeftDock()
        toggleNodePanel()
      }
    }
  ]

  return (
    <div className="sm:hidden">
      {/* Toggle button (FAB) */}
      <div className="fixed bottom-4 right-4 z-40">
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
          'fixed bottom-20 right-4 z-40 w-[220px] rounded-xl border border-neutral-200 bg-white/95 backdrop-blur shadow-xl transition-all',
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
