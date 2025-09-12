import type { GraphDataType } from '../../state/GraphState'
import { fetchBaserow } from './fetchBaserow'
import { fetchCTA } from './fetchCTA'

export type DataFetcher = () => Promise<GraphDataType>

export const dataSourceFetchers: Record<string, DataFetcher> = {
  www: fetchBaserow,
  federation: async () => ({ nodes: [], links: [] }),
  cta: fetchCTA,
  gaia: async () => ({ nodes: [], links: [] }),
  newcoin: async () => ({ nodes: [], links: [] }),
  atlas: async () => ({ nodes: [], links: [] }),
  biom: async () => ({ nodes: [], links: [] }),
  nao: async () => ({ nodes: [], links: [] })
}
