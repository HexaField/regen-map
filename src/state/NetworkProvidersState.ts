import { createSimpleStore } from '@hexafield/simple-store/react'

// Visualize my network providers
export type NetworkProvider = { name: string; placeholder: string }

export const NetworkProvidersState: ReturnType<typeof createSimpleStore<NetworkProvider[]>> = createSimpleStore<
  NetworkProvider[]
>([
  { name: 'Twitter', placeholder: '@username or url' },
  { name: 'Linked In', placeholder: '@username or url' },
  { name: 'Instagram', placeholder: '@username or url' }
])
