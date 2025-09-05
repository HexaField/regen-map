import { useSimpleStore } from '@hexafield/simple-store/react'
import ForceGraph3D, { type ForceGraph3DInstance } from '3d-force-graph'
import React, { useEffect, useMemo, useRef } from 'react'
import SpriteText from 'three-spritetext'

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
    entities: Entity[]
    relationships: Relationship[]
  }
}

type Entity = {
  predicate: string
  name: string
  primary_url: string
  description: string[] | string
  images: string[] | string
  urls: string[] | string
  country_name: string
  geolocation: string
}

type Relationship = {
  subject_url: string
  object_url: string
  predicate_url: string
  meta: string[] | string
}

type Node = Entity & {
  id: string
  type: 'person' | 'project' | 'organization'
}

type Edge = {
  source: Node
  target: Node
  index: number
  __controlPoints: null
  __indexColor: string
  type: string
  meta: string[] | string
}

export const Graph = () => {
  // state
  const [data, setData] = useSimpleStore<{ nodes: Node[]; edges: Edge[] }>({ nodes: [], edges: [] })

  // refs for container and graph instance
  const containerRef = useRef<HTMLDivElement | null>(null)
  const fgRef = useRef<ForceGraph3DInstance<Node, Edge> | null>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)

  // fetch data once
  useEffect(() => {
    let cancelled = false
    fetchSheets()
      .then((sheetData) => {
        if (cancelled) return
        // Align node ids with relationship URLs so links resolve
        const nodes: Node[] = sheetData.entities.map((entity) => ({
          ...entity,
          type: entity.predicate.split(':')[0] as 'person' | 'project' | 'organization',
          id: entity.predicate
        }))

        const edges: Edge[] = sheetData.relationships
          .filter((e) => nodes.find((n) => n.id === e.subject_url) && nodes.find((n) => n.id === e.object_url)) // filter out incomplete edges
          .map((edge, i) => {
            // ensure source and target are NodeData objects, and add index and __controlPoints if missing to fix bug in force-graph
            const sourceNode = nodes.find((n) => n.id === edge.subject_url)
            const targetNode = nodes.find((n) => n.id === edge.object_url)

            return {
              source: sourceNode!,
              target: targetNode!,
              index: i++,
              __controlPoints: null,
              __indexColor: '#a8001e',
              type: edge.predicate_url.split('/').at(-1) || 'relatedTo',
              meta: edge.meta
            }
          })

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
      const instance = new ForceGraph3D(containerRef.current!) as any as ForceGraph3DInstance<Node, Edge>
      fgRef.current = instance

      // basic styling & behavior
      instance.backgroundColor('#f5f5f4') // neutral-100
      instance.showNavInfo(false)
      instance.nodeRelSize(6)
      instance.nodeOpacity(0.9)
      instance.nodeColor((node) => {
        if (node.type === 'person') return 'blue'
        if (node.type === 'project') return 'orange'
        if (node.type === 'organization') return 'green'
        return 'gray'
      })
      instance.linkOpacity(0.3)
      instance.linkWidth(1)
      instance.linkColor(() => 'rgba(0,0,0,0.35)')
      instance.cooldownTime(3000)
      // Keep default tooltip label if desired
      instance.nodeLabel('name')
      instance.nodeThreeObjectExtend(true)
      instance.nodeThreeObject((node: any) => {
        const label: any = new SpriteText(node.name || '')
        label.textHeight = 3
        label.color = '#111'
        label.backgroundColor = 'rgba(255,255,255,0.85)'
        label.padding = 2
        if (label.material) {
          label.material.depthWrite = false
          label.material.depthTest = false
        }
        // @ts-ignore - renderOrder exists at runtime on Object3D
        label.renderOrder = 999
        return label
      })
      instance.linkLabel((link: Edge) => {
        const linkSource = link.source as Node
        const linkTarget = link.target as Node
        switch (link.type) {
          case 'memberOf':
            return linkSource.name + ' is a member of ' + linkTarget.name
          case 'knows':
            return linkSource.name + ' knows ' + linkTarget.name
          case 'maintainer':
            return linkSource.name + ' is a maintainer of ' + linkTarget.name
          case 'softwareRequirement':
            return linkSource.name + ' has a software requirement of ' + linkTarget.name
          default:
            return 'Unknown Link'
        }
      })
      instance.linkColor((link) => {
        switch (link.type) {
          case 'memberOf':
            return 'orange'
          case 'knows':
            return 'purple'
          case 'maintainer':
            return 'red'
          case 'softwareRequirement':
            return 'cyan'
          case 'tag':
            return 'orange'
          default:
            return 'black'
        }
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
