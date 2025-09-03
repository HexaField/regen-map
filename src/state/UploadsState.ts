import { createSimpleStore } from '@hexafield/simple-store/react'

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
