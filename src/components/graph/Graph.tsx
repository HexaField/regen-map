import { useSimpleStore } from '@hexafield/simple-store/react'
import React, { useEffect } from 'react'

const key = import.meta.env.VITE_GOOGLE_SHEETS_API
const spreadsheetId = '1cs3E9rhzW_wtLg4O7ybIIXkU5gCS_Q0dA5csQ0MVY6g'

const fetchSheet = async (range: string) => {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueRenderOption=UNFORMATTED_VALUE&key=${key}`
  const res = await fetch(url, { cache: 'no-store' }) // avoid browser cache
  const data = await res.json() // { range, majorDimension, values: [...] }
  // data.values is an array of arrays (rows)
  const values = data.values
  const headers = values[0] as string[] // first row is the header
  const rows = values.slice(1) as string[][] // remaining rows are the data

  const result = rows.map((row) => {
    const entry = {} as Record<string, string | string[]>
    headers.forEach((header, i) => {
      const rowArray = row[i]?.includes(',') ? row[i].split(',').map((item) => item.trim()) : row[i]
      entry[header] = rowArray
    })
    return entry
  })

  return result
}

const fetchSheets = async () => {
  const [entities, relationships] = await Promise.all([
    fetchSheet(encodeURIComponent('Entities')),
    fetchSheet(encodeURIComponent('Relationships'))
  ])

  console.log({ entities, relationships })
  return { entities, relationships } as {
    entities: Omit<Node, 'id'>[]
    relationships: {
      id: string
      subject_url: string
      object_url: string
      predicate_url: string
      meta: string[] | string
    }[]
  }
}

type Node = {
  id: string
  predicate: string
  name: string
  primary_url: string
  description: string[] | string
  images: string[] | string
  urls: string[] | string
  country_name: string
  geolocation: string
}

type Edge = {
  source: string
  target: string
  type: string
  meta: string[] | string
}

export const Graph = () => {
  const [data, setData] = useSimpleStore<{ nodes: Node[]; edges: Edge[] }>({ nodes: [], edges: [] })
  useEffect(() => {
    fetchSheets().then((data) => {
      setData({
        nodes: data.entities.map((entity) => ({ ...entity, id: entity.predicate })),
        edges: data.relationships.map((rel) => ({
          source: rel.subject_url,
          target: rel.object_url,
          type: rel.predicate_url,
          meta: rel.meta
        }))
      })
    })
  }, [])

  console.log(data)

  return <div>Graph component</div>
}
