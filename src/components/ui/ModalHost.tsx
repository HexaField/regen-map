import { useSimpleStore } from '@hexafield/simple-store/react'
import React from 'react'

import { closeModal, ModalRegistryState } from '../../state/ModalState'
import { DraggableResizableModal } from './DraggableResizableModal'

const modalDefaults: Record<string, Partial<Parameters<typeof DraggableResizableModal>[0]>> = {
  about: { title: 'About', initialWidth: 460, initialHeight: 420, initialX: 120, initialY: 180 },
  graphConfig: { title: 'Graph Settings', initialWidth: 420, initialHeight: 480, initialX: 96, initialY: 160 },
  panels: {
    title: 'Panels',
    initialWidth: 360,
    initialHeight: 520,
    initialX: 24,
    initialY: 112,
    minWidth: 280,
    minHeight: 240
  },
  nodeInfo: {
    title: 'Node Information',
    initialWidth: 360,
    initialHeight: 600,
    initialX: 960,
    initialY: 112,
    minWidth: 320,
    minHeight: 260
  }
}

export function ModalHost() {
  const [modals] = useSimpleStore(ModalRegistryState)
  if (!modals.length) return null

  return (
    <>
      {modals.map((m) => {
        const C = m.component as React.ComponentType<any>
        const defaults = modalDefaults[m.id] || {}
        return (
          <DraggableResizableModal key={m.id} {...defaults} onClose={() => closeModal(m.id)}>
            <C {...m.props} />
          </DraggableResizableModal>
        )
      })}
    </>
  )
}
