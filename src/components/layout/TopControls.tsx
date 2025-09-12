import { useSimpleStore } from '@hexafield/simple-store/react'
import React from 'react'

import { AppTab, AppTabState } from '../../state/AppTabsState'
import { closeFocusedNode, FocusedNodeState, GraphState } from '../../state/GraphState'
import { toggleModal } from '../../state/ModalState'
import { SearchQueryState } from '../../state/SearchState'
import { ViewMode, ViewModeState } from '../../state/ViewModeState'
import { applyTheme, getTheme, ThemeMode } from '../../theme'
import { GraphConfigModalContent } from '../graph/GraphConfigModal'
import { Button } from '../ui/Button'
import { GitHubIcon } from '../ui/GitHubIcon'
import { Input } from '../ui/Input'
import { Segmented } from '../ui/Segmented'
import { Tabs } from '../ui/Tabs'
import { AboutModalContent } from './AboutModal'

export function TopControls() {
  const [tab, setTab] = useSimpleStore(AppTabState)
  const [mode, setMode] = useSimpleStore(ViewModeState)
  const [query, setQuery] = useSimpleStore(SearchQueryState)
  const [focusedNodes, setFocusedNodes] = useSimpleStore(FocusedNodeState)
  const [theme, setTheme] = React.useState<ThemeMode>(() => (typeof window !== 'undefined' ? getTheme() : 'system'))

  const onThemeChange = (mode: ThemeMode) => {
    setTheme(mode)
    if (typeof window !== 'undefined') applyTheme(mode)
  }

  return (
    <div className="absolute w-full z-30 flex flex-row justify-between items-center bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
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
            // Placeholder tab logic
            setTab(clicked)
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
      <div className="z-30 hidden p-6 sm:flex items-center gap-3">
        <Input
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const q = (query || '').trim().toLowerCase()
              if (!q) {
                setFocusedNodes([])
                return
              }
              const matches = GraphState.get().nodes.filter((n) => (n.name || '').toLowerCase().includes(q))
              setFocusedNodes(matches)
            }
          }}
          className="w-[260px]"
        />
        <Button
          variant="ghost"
          className="rounded-full"
          onClick={() => toggleModal('graphConfig', GraphConfigModalContent)}
        >
          Graph Settings
        </Button>
        <Button
          variant="ghost"
          disabled={!focusedNodes.length}
          className="rounded-full"
          onClick={() => closeFocusedNode()}
        >
          Node Information
        </Button>
      </div>

      {/* About (left) + GitHub buttons (hidden on mobile; shown from sm+) */}
      <div className="z-30 hidden p-6 sm:flex items-center gap-3">
        <button
          type="button"
          onClick={() => toggleModal('about', AboutModalContent)}
          className="h-12 w-12 flex items-center justify-center rounded-full border-1 border-neutral-800 dark:border-neutral-200 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          aria-label="About this project"
        >
          <span className="inline-block text-[18px] leading-none font-semibold">?</span>
        </button>
        <a
          href="https://github.com/HexaField/regen-map"
          target="_blank"
          rel="noopener noreferrer"
          className="h-12 w-12 flex items-center justify-center rounded-full border-1 border-neutral-800 dark:border-neutral-200 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          aria-label="View on GitHub"
        >
          <GitHubIcon size={30} />
        </a>
      </div>
    </div>
  )
}
