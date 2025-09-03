import { createSimpleStore } from '@hexafield/simple-store/react'

// Tabs across the app
export type AppTab = 'Community Data' | 'Visualize My Network' | 'Upload File'
export const AppTabState = createSimpleStore<AppTab>('Community Data')

// Convenience action
export const setTab = (tab: AppTab) => AppTabState.set(tab)
