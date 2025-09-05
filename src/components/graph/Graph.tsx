import { useSimpleStore } from '@hexafield/simple-store/react'
import ForceGraph3D, { type ForceGraph3DInstance } from '3d-force-graph'
import React, { useEffect, useRef } from 'react'
import SpriteText from 'three-spritetext'

import {
  Entity,
  FocusedNodeState,
  GraphState,
  Link,
  Node,
  Relationship,
  RuntimeNode,
  setFocusedNode
} from '../../state/GraphState'
import { SelectedProfileState } from '../../state/ProfileState'

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
  const [entities, relationships, ecosystemEntities, ecosystemRelationships] = await Promise.all([
    fetchSheet(encodeURIComponent('Entities')),
    fetchSheet(encodeURIComponent('Relationships')),
    fetchSheet(encodeURIComponent('EcosystemEntities')),
    fetchSheet(encodeURIComponent('EcosystemRelationships'))
  ])

  console.log({ entities, relationships, ecosystemEntities, ecosystemRelationships })
  return { entities, relationships, ecosystemEntities, ecosystemRelationships } as {
    entities: Entity[]
    relationships: Relationship[]
    ecosystemEntities: Entity[]
    ecosystemRelationships: Relationship[]
  }
}

export const Graph = () => {
  // state
  const [data, setData] = useSimpleStore(GraphState)

  // refs for container and graph instance
  const containerRef = useRef<HTMLDivElement | null>(null)
  const fgRef = useRef<ForceGraph3DInstance<RuntimeNode, Link> | null>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)

  const [focusedNode] = useSimpleStore(FocusedNodeState)
  const [profile, setProfile] = useSimpleStore(SelectedProfileState)

  // fetch data once
  useEffect(() => {
    let cancelled = false
    fetchSheets()
      .then((sheetData) => {
        if (cancelled) return
        const entities = [sheetData.entities, sheetData.ecosystemEntities].flat().filter((e) => !!e.predicate)
        // Align node ids with relationship URLs so links resolve
        const nodes: Node[] = entities.map((entity) => ({
          ...entity,
          type: entity.predicate.split(':')[0] as 'person' | 'project' | 'organization',
          id: entity.predicate
        }))
        const relationships = [sheetData.relationships, sheetData.ecosystemRelationships]
          .flat()
          .filter((e) => !!e.predicate_url)

        // Build initial edges array
        const edges: Link[] = relationships
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

        // Compute multi-link curvature so parallel links bow outwards and don't overlap
        // Group links by unordered pair of node ids
        const groups = new Map<string, Link[]>()
        for (const l of edges) {
          const a = (l.source as Node).id
          const b = (l.target as Node).id
          const key = a < b ? `${a}__${b}` : `${b}__${a}`
          if (!groups.has(key)) groups.set(key, [])
          groups.get(key)!.push(l)
        }
        const BOW_STEP = 0.2 // curvature step between parallel links
        for (const [key, links] of groups.entries()) {
          if (links.length === 1) {
            // straight line
            links[0].curvature = 0
            links[0].curveRotation = 0
            links[0].multiIndex = 0
            links[0].multiCount = 1
            continue
          }
          // sort for stable assignment (optionally by type then index)
          links.sort((l1, l2) => (l1.type || '').localeCompare(l2.type || '') || l1.index - l2.index)
          const count = links.length
          // Distribute indices around zero: e.g., 4 -> [-1.5,-0.5,0.5,1.5], 3 -> [-1,0,1]
          const offsets = links.map((_, i) => i - (count - 1) / 2)
          links.forEach((l, i) => {
            l.multiIndex = i
            l.multiCount = count
            l.curvature = offsets[i] * BOW_STEP
            // rotate each curved link around its axis so they spread in a ring for 3D. Use golden angle for variety.
            const golden = Math.PI * (3 - Math.sqrt(5))
            l.curveRotation = (i * golden) % (Math.PI * 2)
          })
        }

        setData((prev) => {
          prev.nodes = nodes
          prev.links = edges
          return prev
        })
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch sheets', err)
      })
    return () => {
      cancelled = true
    }
  }, [setData])

  // initialize the ForceGraph3D instance once
  useEffect(() => {
    if (!containerRef.current) return
    if (!fgRef.current) {
      const instance = new ForceGraph3D(containerRef.current!) as any as ForceGraph3DInstance<RuntimeNode, Link>
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
      // helper to detect proposed links via meta field
      const isProposed = (link: Link) => {
        const m = link.meta
        if (!m) return false
        if (Array.isArray(m)) return m.some((s) => (s || '').toLowerCase().includes('proposed'))
        return (m || '').toLowerCase().includes('proposed')
      }
      // width and base color adapt to meta:proposed
      instance.linkWidth((link) => (isProposed(link as Link) ? 0.6 : 1))
      instance.linkColor((link) => (isProposed(link as Link) ? '#9ca3af' : 'rgba(0,0,0,0.35)'))
      // Direction cones to indicate source -> target
      instance.linkDirectionalArrowLength((link) => (isProposed(link as Link) ? 3 : 6))
      instance.linkDirectionalArrowRelPos(0.6)
      instance.linkDirectionalArrowResolution(8)
      instance.linkDirectionalArrowColor((link) => {
        if (isProposed(link as Link)) return '#9ca3af'
        // match linkColor
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
      instance.cooldownTime(3000)
      // Keep default tooltip label if desired
      instance.nodeLabel('name')
      instance.nodeThreeObjectExtend(true)
      instance.nodeThreeObject((node: Node) => {
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
      instance.linkLabel((link: Link) => {
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
        if (isProposed(link as Link)) return '#9ca3af'
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
      // Apply curvature and rotation for multi-links
      instance.linkCurvature((l) => l.curvature ?? 0)
      instance.linkCurveRotation((l) => l.curveRotation ?? 0)
      instance.onNodeClick((n) => {
        setFocusedNode(n)
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

  useEffect(() => {
    if (!focusedNode || !fgRef.current) return

    const node = focusedNode

    // center camera on node
    const distance = 120
    const distRatio = 1 + distance / Math.hypot(node?.x || 0, node?.y || 0, node?.z || 0)
    fgRef.current.cameraPosition(
      {
        x: (node?.x || 0) * distRatio,
        y: (node?.y || 0) * distRatio,
        z: (node?.z || 0) * distRatio
      },
      {
        x: node?.x || 0,
        y: node?.y || 0,
        z: node?.z || 0
      },
      800
    )
  }, [focusedNode])

  useEffect(() => {
    if (!profile?.id || profile.id === focusedNode?.id) return
    setFocusedNode(data.nodes.find((n) => n.id === profile.id)!)
  }, [profile?.id])

  // update data on instance when it changes
  useEffect(() => {
    if (!fgRef.current) return
    fgRef.current.graphData(data)
    // try to fit the graph nicely on first load of data
    if (data.nodes?.length) {
      setTimeout(() => fgRef.current?.zoomToFit(400, 40), 0)
    }
  }, [data.links, data.nodes])

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
