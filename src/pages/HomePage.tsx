import { useSimpleStore } from '@hexafield/simple-store/react'
import React from 'react'

import { Graph } from '../components/graph/Graph'
import { GraphConfigModal } from '../components/graph/GraphConfigModal'
import { AppShell, LeftDock, RightDock } from '../components/layout/AppShell'
import { LeftPanels } from '../components/layout/LeftPanels'
import { MobileActions } from '../components/layout/MobileActions'
import { RightDrawer } from '../components/layout/RightDrawer'
import { TopControls } from '../components/layout/TopControls'
import { ViewModeState } from '../state/ViewModeState'

export function HomePage() {
  const [mode] = useSimpleStore(ViewModeState)
  return (
    <AppShell>
      <TopControls />

      {mode === 'Graph' && <Graph />}

      <LeftDock>
        <LeftPanels />
      </LeftDock>

      <RightDock>
        <RightDrawer />
      </RightDock>

      <GraphConfigModal />
      <MobileActions />
    </AppShell>
  )
}
