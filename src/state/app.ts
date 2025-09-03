import { createSimpleStore } from '@hexafield/simple-store/react'

// Tabs across the app
export type AppTab = 'Community Data' | 'Visualize My Network' | 'Upload File'
export const AppTabState = createSimpleStore<AppTab>('Community Data')

// Center mode switch (top-center)
export type ViewMode = 'Globe' | 'Map' | 'Graph' | 'CRM'
export const ViewModeState = createSimpleStore<ViewMode>('Globe')

// Global search query (top-right)
export const SearchQueryState = createSimpleStore<string>('')

// Right drawer (Node Information/Profile)
export const NodePanelOpenState = createSimpleStore<boolean>(true)

// Selected profile (simple demo shape for now)
export type Profile = {
  id: string
  name: string
  title: string
  location: string
  links: { label: string; href?: string }[]
  tags: string[]
  bio: string
}
export const SelectedProfileState = createSimpleStore<Profile | null>({
  id: 'dylan',
  name: 'Dylan Tull',
  title: 'Regen World Builder, Creative Strategist, Theorist, & Designer :)',
  location: 'Traverse City, MI',
  links: [{ label: 'Website' }, { label: 'X' }, { label: 'LinkedIn' }, { label: 'IG' }],
  tags: ['Website', 'X', 'LinkedIn', 'IG'],
  bio: 'Regen World Builder, Creative Strategist, Theorist, & Designer :)'
})

// Community data cards shown on the left
export type CommunityCard = {
  title: string
  subtitle?: string
  description?: string
}
export const CommunityCardsState: ReturnType<typeof createSimpleStore<CommunityCard[]>> = createSimpleStore<
  CommunityCard[]
>([
  { title: 'THE FEDERATION', subtitle: 'Global Community of Federated Regenerative Business' },
  { title: 'WWW', subtitle: 'World Wide Web' },
  { title: 'CTA', description: 'Concise details on how you can take action today' },
  { title: 'GAIA AI', description: 'Add acorn to your calendar' },
  { title: 'NEWCOIN', description: 'Get detailed bullet pointed list of everything you missed this week' },
  { title: 'ATLAS', description: 'Find key people who are involved in the initiatives you care about' },
  { title: 'BIOM', description: 'Concise details on how you can take action today' },
  { title: 'NAO', description: 'Concise details on how you can take action today' }
])

// Visualize my network providers
export type NetworkProvider = { name: string; placeholder: string }
export const NetworkProvidersState: ReturnType<typeof createSimpleStore<NetworkProvider[]>> = createSimpleStore<
  NetworkProvider[]
>([
  { name: 'Twitter', placeholder: '@username or url' },
  { name: 'Linked In', placeholder: '@username or url' },
  { name: 'Instagram', placeholder: '@username or url' }
])

// Uploads list (demo)
export type UploadItem = {
  name: string
  sizeLabel: string
  note?: string
}
export const UploadsState: ReturnType<typeof createSimpleStore<UploadItem[]>> = createSimpleStore<UploadItem[]>([
  { name: 'newdatabase.csv', sizeLabel: '', note: 'NOT OPTIMIZED' },
  { name: 'masterdatabase-02.json', sizeLabel: '2.3 mb' },
  { name: 'businessregen-02.csv', sizeLabel: '2.3 mb' },
  { name: 'master.json', sizeLabel: '2.3 mb' },
  { name: 'favoritesdatabase-02.csv', sizeLabel: '2.3 mb' }
])

// Actions (co-located with the state definition for reuse)
export const setTab = (tab: AppTab) => AppTabState.set(tab)
export const setMode = (mode: ViewMode) => ViewModeState.set(mode)
export const setSearch = (q: string) => SearchQueryState.set(q)
export const openNodePanel = () => NodePanelOpenState.set(true)
export const closeNodePanel = () => NodePanelOpenState.set(false)
export const toggleNodePanel = () => NodePanelOpenState.set((v) => !v)
