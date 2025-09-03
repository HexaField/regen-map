import { createSimpleStore } from '@hexafield/simple-store/react'

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
