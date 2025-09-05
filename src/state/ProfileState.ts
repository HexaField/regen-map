import { createSimpleStore } from '@hexafield/simple-store/react'

// Selected profile (simple demo shape for now)
export type Profile = {
  id: string
  name: string
  title: string
  image: string
  location: string
  links: { label: string; href?: string }[]
  tags: string[]
  relationships: { name: string; image: string }[]
}

export const SelectedProfileState = createSimpleStore<Profile | null>(null)
