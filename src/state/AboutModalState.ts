import { createSimpleStore } from '@hexafield/simple-store/react'

// Floating About modal visibility
export const AboutModalOpenState = createSimpleStore<boolean>(false)

export const openAboutModal = () => AboutModalOpenState.set(true)
export const closeAboutModal = () => AboutModalOpenState.set(false)
export const toggleAboutModal = () => AboutModalOpenState.set(v => !v)
