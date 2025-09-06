import { createSimpleStore } from '@hexafield/simple-store/react'

// Floating Graph Configuration modal visibility
export const GraphConfigModalOpenState = createSimpleStore<boolean>(false)

export const openGraphConfigModal = () => GraphConfigModalOpenState.set(true)
export const closeGraphConfigModal = () => GraphConfigModalOpenState.set(false)
export const toggleGraphConfigModal = () => GraphConfigModalOpenState.set((v) => !v)
