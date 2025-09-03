import { createSimpleStore } from '@hexafield/simple-store/react'

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
  { title: 'WWW', subtitle: 'World Wise Web' },
  { title: 'CTA', description: 'Collaborative Tech Alliance' },
  { title: 'GAIA AI', description: "Augmenting Earth's Natural Intelligence" },
  { title: 'NEWCOIN', description: 'A Peer-to-Peer Decentralized AI System' },
  { title: 'ATLAS', description: '' },
  { title: 'BIOM', description: 'Bioregional Manufacturing and R&D Hub' },
  { title: 'NAO', description: 'Networked Adaptive Organisms' }
])
