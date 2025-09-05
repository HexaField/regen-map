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
}

export const Graph = () => {
  useEffect(() => {
    fetchSheets()
  }, [])

  return <div>Graph component</div>
}
