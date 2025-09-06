import { useSimpleStore } from '@hexafield/simple-store/react'
import React, { useEffect, useMemo } from 'react'

import { closeGraphConfigModal, GraphConfigModalOpenState } from '../../state/GraphConfigModalState'
import {
  ensureNodeTypes,
  GraphFilterState,
  setLabelSize,
  setNodeTypeVisibility,
  setOrganizationSpheres,
  setShowProposedEdges
} from '../../state/GraphFilterState'
import { GraphState } from '../../state/GraphState'
import { DraggableResizableModal } from '../ui/DraggableResizableModal'

export function GraphConfigModal() {
  const [open, setOpen] = useSimpleStore(GraphConfigModalOpenState)
  const [data] = useSimpleStore(GraphState)
  const [filters] = useSimpleStore(GraphFilterState)
  // derive types from current data and ensure presence in filter state
  const types = Array.from(new Set(data.nodes.map((n) => n.type).filter(Boolean) as string[]))

  useEffect(() => {
    if (types.length) ensureNodeTypes(types)
  }, [types.join('|')])

  if (!open) return null

  return (
    <DraggableResizableModal
      title="Graph Settings"
      initialWidth={420}
      initialHeight={480}
      initialX={96}
      initialY={160}
      onClose={closeGraphConfigModal}
    >
      <div className="text-[13px] text-neutral-700 space-y-4">
        <div>
          <div className="text-[12px] font-medium text-neutral-500 mb-2">Labels</div>
          <label className="flex items-center gap-3">
            <span className="text-[13px] whitespace-nowrap">Label size</span>
            <input
              type="range"
              min={1}
              max={15}
              step={0.5}
              value={filters.labelSize}
              onChange={(e) => setLabelSize(parseFloat(e.target.value))}
              className="h-2 accent-neutral-700 flex-1"
            />
            <span className="w-8 text-right tabular-nums text-[12px] text-neutral-500">
              {filters.labelSize.toFixed(1)}
            </span>
          </label>
        </div>

        <div>
          <div className="text-[12px] font-medium text-neutral-500 mb-2">Nodes</div>
          <div className="flex flex-col gap-2">
            {types.length === 0 ? (
              <div className="text-[12px] text-neutral-400">No node types found.</div>
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

        <div className="pt-2 border-t border-neutral-200">
          <div className="text-[12px] font-medium text-neutral-500 mb-2">Edges</div>
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

        <div className="pt-2 border-t border-neutral-200">
          <div className="text-[12px] font-medium text-neutral-500 mb-2">Organizations</div>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={filters.organizationSpheres}
              onChange={(e) => setOrganizationSpheres(e.target.checked)}
            />
            <span>Render organizations as enclosing spheres</span>
          </label>
          <div className="text-[12px] text-neutral-500 mt-1">
            When enabled, organization nodes become transparent and a clickable enclosing sphere is drawn around their
            members; member-of forces are slightly stronger.
          </div>
        </div>
      </div>
    </DraggableResizableModal>
  )
}
