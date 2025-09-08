import { useSimpleStore } from '@hexafield/simple-store/react'
import React from 'react'

import { AppTab, AppTabState } from '../../state/AppTabsState'
import { toggleGraphConfigModal } from '../../state/GraphConfigModalState'
import { closeFocusedNode, FocusedNodeState } from '../../state/GraphState'
import { LeftDockOpenState, openLeftDock, toggleLeftDock } from '../../state/LeftDockState'
import { SearchQueryState } from '../../state/SearchState'
import { ViewMode, ViewModeState } from '../../state/ViewModeState'
import { applyTheme, getTheme, ThemeMode } from '../../theme'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Segmented } from '../ui/Segmented'
import { Tabs } from '../ui/Tabs'

export function TopControls() {
  const [tab, setTab] = useSimpleStore(AppTabState)
  const [mode, setMode] = useSimpleStore(ViewModeState)
  const [query, setQuery] = useSimpleStore(SearchQueryState)
  const [leftOpen] = useSimpleStore(LeftDockOpenState)
  const [focusedNode] = useSimpleStore(FocusedNodeState)
  const [theme, setTheme] = React.useState<ThemeMode>(() => (typeof window !== 'undefined' ? getTheme() : 'system'))

  const onThemeChange = (mode: ThemeMode) => {
    setTheme(mode)
    if (typeof window !== 'undefined') applyTheme(mode)
  }

  return (
    <div className="z-30 p-6 flex flex-row justify-between items-center text-neutral-900 dark:text-neutral-100">
      {/* Left tabs */}
      {/* <div className="z-30 left-6 flex items-center gap-3">
        <Tabs
          tabs={[
            { id: 'Community Data', label: 'Community Data' }
            // { id: 'Visualize My Network', label: 'Visualize My Network' },
            // { id: 'Upload File', label: 'Upload File' }
          ]}
          value={tab as string}
          onChange={(id) => {
            const clicked = id as AppTab
            if (clicked === tab) {
              // Clicking same tab toggles left dock; also close right panel for a clean view
              toggleLeftDock()
              closeNodePanel()
              return
            }
            // Switching tabs selects tab and ensures left dock is open
            setTab(clicked)
            if (!leftOpen) openLeftDock()
          }}
        />
      </div> */}

      {/* Center mode selector */}
      {/* <div className="z-30 inset-x-0 flex justify-center pointer-events-none">
        <Segmented
          items={[
            // { id: 'Globe', label: 'Globe' },
            // { id: 'Map', label: 'Map' },
            { id: 'Graph', label: 'Graph' }
            // { id: 'CRM', label: 'CRM' }
          ]}
          value={mode as string}
          onChange={(id) => setMode(id as ViewMode)}
          className="pointer-events-auto"
        />
      </div> */}

      {/* Right search and node info button (hidden on mobile; shown from sm+) */}
      <div className="z-30 right-6 hidden sm:flex items-center gap-3">
        {/* <Input placeholder="Search" value={query} onChange={(e) => setQuery(e.target.value)} className="w-[260px]" /> */}
        <Button variant="ghost" className="rounded-full" onClick={toggleGraphConfigModal}>
          Graph Settings
        </Button>
        <Button variant="ghost" disabled={!focusedNode} className="rounded-full" onClick={() => closeFocusedNode()}>
          Node Information
        </Button>
      </div>
    </div>
  )
}
