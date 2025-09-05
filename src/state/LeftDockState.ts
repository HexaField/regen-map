import { createSimpleStore } from '@hexafield/simple-store/react'

// Left dock (panels) visibility
export const LeftDockOpenState = createSimpleStore<boolean>(false) // hidden by default

export const openLeftDock = () => LeftDockOpenState.set(true)
export const closeLeftDock = () => LeftDockOpenState.set(false)
export const toggleLeftDock = () => LeftDockOpenState.set((v) => !v)
