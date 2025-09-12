import { useSimpleStore } from '@hexafield/simple-store/react'
import React from 'react'

import { Graph } from '../components/graph/Graph'
import { AppShell } from '../components/layout/AppShell'
import { LeftPanels } from '../components/layout/LeftPanels'
import { MobileActions } from '../components/layout/MobileActions'
import { RightDrawer } from '../components/layout/RightDrawer'
import { TopControls } from '../components/layout/TopControls'
import { ModalHost } from '../components/ui/ModalHost'
import { AppTabState } from '../state/AppTabsState'
import { FocusedNodeState } from '../state/GraphState'
import { closeModal, isModalOpen, openModal } from '../state/ModalState'
import { ViewModeState } from '../state/ViewModeState'

export function HomePage() {
  const [mode] = useSimpleStore(ViewModeState)
  const [focused] = useSimpleStore(FocusedNodeState)
  const [tab] = useSimpleStore(AppTabState)

  // Manage Panels modal based on tab selection
  // React.useEffect(() => {
  //   if (tab === 'Community Data') {
  //     if (!isModalOpen('panels')) openModal('panels', () => <LeftPanels />)
  //   } else {
  //     if (isModalOpen('panels')) closeModal('panels')
  //   }
  // }, [tab])

  // Manage Node Information modal based on focused nodes
  React.useEffect(() => {
    if (focused.length) {
      if (!isModalOpen('nodeInfo')) openModal('nodeInfo', () => <RightDrawer />)
    } else if (isModalOpen('nodeInfo')) {
      closeModal('nodeInfo')
    }
  }, [focused.length])

  return (
    <AppShell>
      <TopControls />

      {mode === 'Graph' && <Graph />}

      <ModalHost />
      <MobileActions />
    </AppShell>
  )
}
