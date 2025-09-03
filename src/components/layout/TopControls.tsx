import { useSimpleStore } from '@hexafield/simple-store/react'
import React from 'react'

import { AppTab, AppTabState } from '../../state/AppTabsState'
import { toggleNodePanel } from '../../state/NodePanelState'
import { SearchQueryState } from '../../state/SearchState'
import { ViewMode, ViewModeState } from '../../state/ViewModeState'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Segmented } from '../ui/Segmented'
import { Tabs } from '../ui/Tabs'

export function TopControls() {
  const [tab, setTab] = useSimpleStore(AppTabState)
  const [mode, setMode] = useSimpleStore(ViewModeState)
  const [query, setQuery] = useSimpleStore(SearchQueryState)

  return (
    <div className="relative z-30 p-6 flex flex-row justify-between items-center">
      {/* Left tabs */}
      <div className="z-30 left-6 flex items-center gap-3">
        <Tabs
          tabs={[
            { id: 'Community Data', label: 'Community Data' },
            { id: 'Visualize My Network', label: 'Visualize My Network' },
            { id: 'Upload File', label: 'Upload File' }
          ]}
          value={tab as string}
          onChange={(id) => setTab(id as AppTab)}
        />
      </div>

      {/* Center mode selector */}
      <div className="z-30 inset-x-0 flex justify-center pointer-events-none">
        <Segmented
          items={[
            { id: 'Globe', label: 'Globe' },
            { id: 'Map', label: 'Map' },
            { id: 'Graph', label: 'Graph' },
            { id: 'CRM', label: 'CRM' }
          ]}
          value={mode as string}
          onChange={(id) => setMode(id as ViewMode)}
          className="pointer-events-auto"
        />
      </div>

      {/* Right search and node info button */}
      <div className="z-30 right-6 flex items-center gap-3">
        <Input placeholder="Search" value={query} onChange={(e) => setQuery(e.target.value)} className="w-[260px]" />
        <Button variant="ghost" className="rounded-full" onClick={toggleNodePanel}>
          Node Information
        </Button>
      </div>
    </div>
  )
}
