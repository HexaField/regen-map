import { useSimpleStore } from '@hexafield/simple-store/react'
import React, { useEffect } from 'react'

import {
  ensureNodeTypes,
  GraphFilterState,
  setFocusFade,
  setLabelSize,
  setNodeTypeVisibility,
  setOrganizationSpheres,
  setShowProposedEdges
} from '../../state/GraphFilterState'
import { GraphState } from '../../state/GraphState'
import { applyTheme, getTheme, ThemeMode } from '../../theme'
import { Segmented } from '../ui/Segmented'

// Pure content component for graph configuration
export function GraphConfigModalContent() {
  const [data] = useSimpleStore(GraphState)
  const [filters] = useSimpleStore(GraphFilterState)
  const [themeMode, setThemeMode] = React.useState<ThemeMode>(() => getTheme())
  // derive types from current data and ensure presence in filter state
  const types = Array.from(new Set(data.nodes.map((n) => n.type).filter(Boolean) as string[]))

  useEffect(() => {
    if (types.length) ensureNodeTypes(types)
  }, [types.join('|')])

  return (
    <div className="text-[13px] text-neutral-700 dark:text-neutral-200 space-y-4">
      <div>
        <div className="text-[12px] font-medium text-neutral-500 dark:text-neutral-400 mb-2">Theme</div>
        <Segmented
          items={[
            { id: 'light', label: 'Light' },
            { id: 'dark', label: 'Dark' },
            { id: 'system', label: 'System' }
          ]}
          value={themeMode}
          onChange={(id) => {
            const m = id as ThemeMode
            setThemeMode(m)
            applyTheme(m)
          }}
        />
      </div>
      <div>
        <div className="text-[12px] font-medium text-neutral-500 dark:text-neutral-400 mb-2">Focus</div>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={filters.focusFade}
            onChange={(e) => setFocusFade(e.target.checked)}
          />
          <span>Fade non-focused nodes and links</span>
        </label>
      </div>
      <div>
        <div className="text-[12px] font-medium text-neutral-500 dark:text-neutral-400 mb-2">Labels</div>
        <label className="flex items-center gap-3">
          <span className="text-[13px] whitespace-nowrap">Label size</span>
          <input
            type="range"
            min={1}
            max={15}
            step={0.5}
            value={filters.labelSize}
            onChange={(e) => setLabelSize(parseFloat(e.target.value))}
            className="h-2 accent-neutral-700 dark:accent-neutral-300 flex-1"
          />
          <span className="w-8 text-right tabular-nums text-[12px] text-neutral-500 dark:text-neutral-400">
            {filters.labelSize.toFixed(1)}
          </span>
        </label>
      </div>

      <div>
        <div className="text-[12px] font-medium text-neutral-500 dark:text-neutral-400 mb-2">Nodes</div>
        <div className="flex flex-col gap-2">
          {types.length === 0 ? (
            <div className="text-[12px] text-neutral-400 dark:text-neutral-500">No node types found.</div>
          ) : (
            types.map((t) => (
              <label key={t} className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={filters.visibleNodeTypes[t] !== false}
                  onChange={(e) => setNodeTypeVisibility(t, e.target.checked)}
                />
                <span className="capitalize">{t}</span>
              </label>
            ))
          )}
        </div>
      </div>

      <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800">
        <div className="text-[12px] font-medium text-neutral-500 dark:text-neutral-400 mb-2">Edges</div>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={filters.showProposedEdges}
            onChange={(e) => setShowProposedEdges(e.target.checked)}
          />
          <span>Show proposed edges</span>
        </label>
      </div>

      <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800">
        <div className="text-[12px] font-medium text-neutral-500 dark:text-neutral-400 mb-2">Organizations</div>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={filters.organizationSpheres}
            onChange={(e) => setOrganizationSpheres(e.target.checked)}
          />
          <span>Render organizations as enclosing spheres</span>
        </label>
        <div className="text-[12px] text-neutral-500 dark:text-neutral-400 mt-1">
          When enabled, organization nodes become transparent and a clickable enclosing sphere is drawn around their
          members; member-of forces are slightly stronger.
        </div>
      </div>
    </div>
  )
}
