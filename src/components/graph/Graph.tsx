import { useSimpleStore } from '@hexafield/simple-store/react'
import ForceGraph3D, { type ForceGraph3DInstance } from '3d-force-graph'
import React, { useEffect, useMemo, useRef } from 'react'

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
  // state
  const [data, setData] = useSimpleStore<{ nodes: Node[]; edges: Edge[] }>({ nodes: [], edges: [] })

  // refs for container and graph instance
  const containerRef = useRef<HTMLDivElement | null>(null)
  const fgRef = useRef<ForceGraph3DInstance | null>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)

  // fetch data once
  useEffect(() => {
    let cancelled = false
    fetchSheets()
      .then((sheetData) => {
        if (cancelled) return
        // Align node ids with relationship URLs so links resolve
        const nodes: Node[] = sheetData.entities.map((entity) => ({ ...entity, id: entity.predicate }))
        const edges: Edge[] = sheetData.relationships
          .map((rel) => ({
            source: rel.subject_url,
            target: rel.object_url,
            type: rel.predicate_url,
            meta: rel.meta
          }))
          .filter((e) => nodes.find((n) => n.id === e.source) && nodes.find((n) => n.id === e.target)) // filter out incomplete edges
        setData({ nodes, edges })
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch sheets', err)
      })
    return () => {
      cancelled = true
    }
  }, [setData])

  // memoized graphData in the shape expected by 3d-force-graph
  const graphData = useMemo(() => {
    return {
      nodes: data.nodes,
      links: data.edges
    }
  }, [data])

  // initialize the ForceGraph3D instance once
  useEffect(() => {
    if (!containerRef.current) return
    if (!fgRef.current) {
      const instance = new ForceGraph3D(containerRef.current!)
      fgRef.current = instance

      // basic styling & behavior
      instance.backgroundColor('#f5f5f4') // neutral-100
      instance.showNavInfo(false)
      instance.nodeRelSize(6)
      instance.nodeOpacity(0.9)
      instance.linkOpacity(0.3)
      instance.linkWidth(1)
      instance.linkColor(() => 'rgba(0,0,0,0.35)')
      instance.cooldownTime(3000)
      instance.nodeLabel('name')
      instance.linkLabel((l: any) => {
        const ll = l as Edge
        const meta = Array.isArray(ll.meta) ? ll.meta.join(', ') : ll.meta
        return `${ll.type}${meta ? `\n${meta}` : ''}`
      })
      instance.onNodeClick((n: any) => {
        // center camera on node
        const distance = 80
        const distRatio = 1 + distance / Math.hypot(n?.x || 0, n?.y || 0, n?.z || 0)
        instance.cameraPosition(
          {
            x: (n?.x || 0) * distRatio,
            y: (n?.y || 0) * distRatio,
            z: (n?.z || 0) * distRatio
          },
          n,
          800
        )
      })
    }

    // size to container via ResizeObserver
    if (!resizeObserverRef.current) {
      resizeObserverRef.current = new ResizeObserver((entries) => {
        const entry = entries[0]
        if (!entry || !fgRef.current) return
        const { width, height } = entry.contentRect
        fgRef.current.width(width)
        fgRef.current.height(height)
      })
    }
    resizeObserverRef.current.observe(containerRef.current)

    return () => {
      try {
        if (containerRef.current && resizeObserverRef.current) {
          resizeObserverRef.current.unobserve(containerRef.current)
        }
      } catch {}
    }
  }, [])

  // update data on instance when it changes
  useEffect(() => {
    if (!fgRef.current) return
    fgRef.current.graphData(graphData)
    // try to fit the graph nicely on first load of data
    if (graphData.nodes?.length) {
      setTimeout(() => fgRef.current?.zoomToFit(400, 40), 0)
    }
  }, [graphData])

  // cleanup on unmount
  useEffect(() => {
    return () => {
      // remove canvas from DOM to help GC
      if (containerRef.current) {
        while (containerRef.current.firstChild) containerRef.current.removeChild(containerRef.current.firstChild)
      }
      fgRef.current = null
    }
  }, [])

  return (
    <div className="w-full flex-1 px-6 pb-6">
      <div
        ref={containerRef}
        className="w-full rounded-xl shadow-sm border border-neutral-200 bg-white"
        style={{ height: 'calc(100vh - 180px)', minHeight: 360 }}
      />
    </div>
  )
}
