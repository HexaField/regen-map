import { useSimpleStore } from '@hexafield/simple-store/react'
import React from 'react'

import { Graph } from '../components/graph/Graph'
import { AppShell, LeftDock, RightDock } from '../components/layout/AppShell'
import { LeftPanels } from '../components/layout/LeftPanels'
import { RightDrawer } from '../components/layout/RightDrawer'
import { TopControls } from '../components/layout/TopControls'
import { ViewModeState } from '../state/ViewModeState'
import { GraphConfigModal } from '../components/graph/GraphConfigModal'

export function HomePage() {
  const [mode] = useSimpleStore(ViewModeState)
  return (
    <AppShell>
      <TopControls />

      {/* Main content area with big circle placeholder for the globe */}
      <div className="absolute flex justify-center">{mode === 'Graph' && <Graph />}</div>

      <LeftDock>
        <LeftPanels />
      </LeftDock>

      <RightDock>
        <RightDrawer />
      </RightDock>

  {/* Floating modals */}
  <GraphConfigModal />
    </AppShell>
  )
}
