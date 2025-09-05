import { createSimpleStore } from '@hexafield/simple-store/react'

// Community data cards shown on the left
export type CommunityCard = {
  id: string // unique key for dataset
  title: string
  subtitle?: string
  description?: string
  source?: 'www' | 'federation' | 'cta' | 'gaia' | 'newcoin' | 'atlas' | 'biom' | 'nao'
  enabled: boolean
}

export const CommunityCardsState: ReturnType<typeof createSimpleStore<CommunityCard[]>> = createSimpleStore<
  CommunityCard[]
>([
  {
    id: 'federation',
    title: 'THE FEDERATION',
    subtitle: 'Global Community of Federated Regenerative Business',
    source: 'federation',
    enabled: false
  },
  { id: 'www', title: 'WWW', subtitle: 'World Wise Web', source: 'www', enabled: true },
  { id: 'cta', title: 'CTA', description: 'Collaborative Tech Alliance', source: 'cta', enabled: false },
  {
    id: 'gaia',
    title: 'GAIA AI',
    description: "Augmenting Earth's Natural Intelligence",
    source: 'gaia',
    enabled: false
  },
  {
    id: 'newcoin',
    title: 'NEWCOIN',
    description: 'A Peer-to-Peer Decentralized AI System',
    source: 'newcoin',
    enabled: false
  },
  { id: 'atlas', title: 'ATLAS', description: 'Atlas Research Group', source: 'atlas', enabled: false },
  { id: 'biom', title: 'BIOM', description: 'Bioregional Manufacturing and R&D Hub', source: 'biom', enabled: false },
  { id: 'nao', title: 'NAO', description: 'Networked Adaptive Organisms', source: 'nao', enabled: false }
])
