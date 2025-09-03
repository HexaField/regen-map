import { createSimpleStore } from '@hexafield/simple-store/react'

// Global search query (top-right)
export const SearchQueryState = createSimpleStore<string>('')

export const setSearch = (q: string) => SearchQueryState.set(q)
