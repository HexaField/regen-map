import React from 'react'

import { AppShell, LeftDock, RightDock } from '../components/layout/AppShell'
import { LeftPanels } from '../components/layout/LeftPanels'
import { RightDrawer } from '../components/layout/RightDrawer'
import { TopControls } from '../components/layout/TopControls'

export function HomePage() {
  return (
    <AppShell>
      <TopControls />

      {/* Main content area with big circle placeholder for the globe */}
      <div className="flex justify-center">{/* @placeholder */}</div>

      <LeftDock>
        <LeftPanels />
      </LeftDock>

      <RightDock>
        <RightDrawer />
      </RightDock>
    </AppShell>
  )
}
