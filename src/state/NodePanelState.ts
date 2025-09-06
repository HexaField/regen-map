import { createSimpleStore } from '@hexafield/simple-store/react'

// Right drawer (Node Information/Profile)
export const NodePanelOpenState = createSimpleStore<boolean>(false)

export const openNodePanel = () => NodePanelOpenState.set(true)
export const closeNodePanel = () => NodePanelOpenState.set(false)
export const toggleNodePanel = () => NodePanelOpenState.set((v) => !v)
