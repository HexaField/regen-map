import React, { useEffect } from 'react'

import { Graph } from '../components/graph/Graph'
import { AppShell, LeftDock, RightDock } from '../components/layout/AppShell'
import { LeftPanels } from '../components/layout/LeftPanels'
import { RightDrawer } from '../components/layout/RightDrawer'
import { TopControls } from '../components/layout/TopControls'

export function HomePage() {
  return (
    <AppShell>
      <TopControls />

      {/* Main content area with big circle placeholder for the globe */}
      <div className="absolute flex justify-center">
        <Graph />
      </div>

      <LeftDock>
        <LeftPanels />
      </LeftDock>

      <RightDock>
        <RightDrawer />
      </RightDock>
    </AppShell>
  )
}
