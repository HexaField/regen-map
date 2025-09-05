import { createSimpleStore } from '@hexafield/simple-store/react'

// Center mode switch (top-center)
export type ViewMode = 'Globe' | 'Map' | 'Graph' | 'CRM'
export const ViewModeState = createSimpleStore<ViewMode>('Graph')

export const setMode = (mode: ViewMode) => ViewModeState.set(mode)
