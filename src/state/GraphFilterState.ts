import { createSimpleStore } from '@hexafield/simple-store/react'

export type GraphFilter = {
  visibleNodeTypes: Record<string, boolean>
  showProposedEdges: boolean
  organizationSpheres: boolean
}

export const GraphFilterState = createSimpleStore<GraphFilter>({
  visibleNodeTypes: {},
  showProposedEdges: true,
  organizationSpheres: false
})

// Ensure that any new types default to visible
export const ensureNodeTypes = (types: string[]) => {
  GraphFilterState.set((prev) => {
    const next: GraphFilter = {
      visibleNodeTypes: { ...prev.visibleNodeTypes },
      showProposedEdges: prev.showProposedEdges,
      organizationSpheres: prev.organizationSpheres
    }
    for (const t of types) {
      if (!(t in next.visibleNodeTypes)) next.visibleNodeTypes[t] = true
    }
    return next
  })
}

export const toggleNodeTypeVisibility = (type: string) =>
  GraphFilterState.set((prev) => ({
    ...prev,
    visibleNodeTypes: { ...prev.visibleNodeTypes, [type]: !(prev.visibleNodeTypes[type] !== false) ? false : true }
  }))

export const setNodeTypeVisibility = (type: string, visible: boolean) =>
  GraphFilterState.set((prev) => ({
    ...prev,
    visibleNodeTypes: { ...prev.visibleNodeTypes, [type]: visible }
  }))

export const setShowProposedEdges = (show: boolean) =>
  GraphFilterState.set((prev) => ({ ...prev, showProposedEdges: show }))

export const setOrganizationSpheres = (on: boolean) =>
  GraphFilterState.set((prev) => ({ ...prev, organizationSpheres: on }))
