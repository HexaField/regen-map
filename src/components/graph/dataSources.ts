import type { GraphDataType } from '../../state/GraphState'
import { fetchCTA } from './fetchCTA'
import { fetchBaserow } from './fetchBaserow'

// A fetcher returns nodes+links for a dataset
export type DataFetcher = () => Promise<GraphDataType>

// Map dataset ids to their fetchers. Stub others for now.
export const dataSourceFetchers: Record<string, DataFetcher> = {
  // World Wise Web
  www: fetchBaserow,
  // TODO: Replace stubs with real implementations as they become available
  federation: async () => ({ nodes: [], links: [] }),
  cta: fetchCTA,
  gaia: async () => ({ nodes: [], links: [] }),
  newcoin: async () => ({ nodes: [], links: [] }),
  atlas: async () => ({ nodes: [], links: [] }),
  biom: async () => ({ nodes: [], links: [] }),
  nao: async () => ({ nodes: [], links: [] })
}
