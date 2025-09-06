import { useSimpleStore } from '@hexafield/simple-store/react'
import ForceGraph3D, { LinkObject, type ForceGraph3DInstance } from '3d-force-graph'
import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import SpriteText from 'three-spritetext'

import { CommunityCardsState } from '../../state/CommunityCardsState'
import {
  Entity,
  FocusedNodeState,
  GraphDataRuntimeType,
  GraphDataType,
  GraphState,
  Link,
  LinkRuntime,
  Node,
  NodeRuntime,
  Relationship,
  setFocusedNode
} from '../../state/GraphState'
import { SelectedProfileState } from '../../state/ProfileState'
import { dataSourceFetchers } from './dataSources'
import { GraphFilterState, ensureNodeTypes } from '../../state/GraphFilterState'

const getLinkKey = (link: Link | LinkRuntime) =>
  `${typeof link.source === 'string' ? link.source : link.source.id}-${link.type}-${typeof link.target === 'string' ? link.target : link.target.id}`

const mergeNodes = (prevData: GraphDataRuntimeType, rawData: GraphDataType) => {
  /** Update nodes whilst preserving existing simulation */
  const existingNodeIDs = new Set<string>(prevData.nodes.map((n) => n.id))
  const existingLinksIDs = new Set<string>(prevData.links.map(getLinkKey))

  const seenNodeIDs = new Set<string>()
  const seenLinkIDs = new Set<string>()

  // Canonical node per name: prefer existing (prevData) node to preserve properties & simulation
  const canonicalByName = new Map<string, Node>()
  for (const n of prevData.nodes as Node[]) {
    if (!canonicalByName.has(n.name)) canonicalByName.set(n.name, n)
  }

  // get all new data
  const newNodesData = [] as Node[]
  const newLinksData = [] as Link[]

  const nodes = rawData.nodes as Node[]
  const rawIdToNode = new Map<string, Node>()
  for (const n of nodes) rawIdToNode.set(n.id, n)

  // Add nodes, deduplicating by name and preserving original properties (existing node wins)
  for (const node of nodes) {
    const existingByName = canonicalByName.get(node.name)
    const canonical = existingByName ?? node
    // Ensure we track canonical id for this name so prev duplicates get pruned
    seenNodeIDs.add(canonical.id)
    if (!existingByName) {
      canonicalByName.set(node.name, canonical)
      if (!existingNodeIDs.has(canonical.id)) {
        newNodesData.push(canonical)
      }
    }
  }

  // remove old nodes
  for (let i = prevData.nodes.length - 1; i >= 0; i--) {
    const node = prevData.nodes[i]
    if (!seenNodeIDs.has(node.id)) {
      // this node is not in the new data, remove it
      prevData.nodes.splice(i, 1)
    }
  }

  // add new nodes and links
  prevData.nodes.push(...newNodesData)

  for (const link of rawData.links as Link[]) {
    // remap link endpoints to canonical nodes by name
    const srcRaw = rawIdToNode.get(link.source) as Node | undefined
    const tgtRaw = rawIdToNode.get(link.target) as Node | undefined
    if (!srcRaw || !tgtRaw) continue
    const src = canonicalByName.get(srcRaw.name)
    const tgt = canonicalByName.get(tgtRaw.name)
    if (!src || !tgt) continue

    const dedupLink: Link = { ...link, source: src.id, target: tgt.id }
    const linkKey = getLinkKey(dedupLink)
    seenLinkIDs.add(linkKey)
    if (!existingLinksIDs.has(linkKey)) {
      newLinksData.push(dedupLink)
    }
  }

  // remove old links
  for (let i = prevData.links.length - 1; i >= 0; i--) {
    const link = prevData.links[i]
    const linkKey = getLinkKey(link)
    if (!seenLinkIDs.has(linkKey)) {
      // this link is not in the new data, remove it
      prevData.links.splice(i, 1)
    }
  }

  let lastLinkIndex =
    prevData.links.find((l) => typeof l.source !== 'string' && typeof l.target !== 'string')?.index ?? 0

  // ensure source and target are NodeData objects, and add index and __controlPoints if missing to fix bug in force-graph
  for (const link of newLinksData) {
    const sourceNode = prevData.nodes.find((n) => n.id === link.source)!
    const targetNode = prevData.nodes.find((n) => n.id === link.target)!

    prevData.links.push({
      ...link,
      source: sourceNode,
      target: targetNode,
      index: lastLinkIndex++,
      __controlPoints: null,
      __indexColor: '#a8001e'
    })
  }

  // return prevData
  return {
    nodes: prevData.nodes,
    links: prevData.links
  }
}

export const Graph = () => {
  // state
  const [data, setData] = useSimpleStore(GraphState)

  // refs for container and graph instance
  const containerRef = useRef<HTMLDivElement | null>(null)
  const fgRef = useRef<ForceGraph3DInstance<NodeRuntime, LinkRuntime> | null>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)

  const [focusedNode] = useSimpleStore(FocusedNodeState)
  const [profile, setProfile] = useSimpleStore(SelectedProfileState)
  const [filters] = useSimpleStore(GraphFilterState)

  // watch enabled community datasets and merge their graphs together
  const [cards] = useSimpleStore(CommunityCardsState)
  useEffect(() => {
    let cancelled = false
    const enabled = cards.filter((c) => c.enabled)
    // If nothing enabled, clear graph via merge to empty
    if (!enabled.length) {
      setData(mergeNodes(GraphState.get(), { nodes: [], links: [] }))
      return () => {
        cancelled = true
      }
    }

    // Accumulate partial results and update after each fetch resolves
    const partialResults: GraphDataType[] = []
    const recomputeAndMerge = () => {
      if (cancelled) return
      // combine datasets by node id, and rewire links to the combined node instances
      const nodeMap = new Map<string, Node>()
      for (const r of partialResults) {
        for (const n of r.nodes) {
          if (!nodeMap.has(n.id)) nodeMap.set(n.id, n)
        }
      }
      const combinedLinks: Link[] = []
      for (const r of partialResults) {
        for (const l of r.links) {
          const sId = typeof l.source === 'string' ? l.source : l.source.id
          const tId = typeof l.target === 'string' ? l.target : l.target.id
          const s = nodeMap.get(sId)
          const t = nodeMap.get(tId)
          if (s && t) {
            combinedLinks.push({
              ...l,
              source: s.id,
              target: t.id
            })
          }
        }
      }
      const combined: GraphDataType = { nodes: Array.from(nodeMap.values()), links: combinedLinks }
      setData(mergeNodes(GraphState.get(), combined))
    }

    for (const c of enabled) {
      const fetcher = dataSourceFetchers[c.id]
      ;(fetcher ? fetcher() : Promise.resolve({ nodes: [], links: [] }))
        .then((res) => {
          if (cancelled) return
          partialResults.push(res)
          recomputeAndMerge()
        })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.error(`Failed to fetch dataset: ${c.id}`, err)
        })
    }
    return () => {
      cancelled = true
    }
  }, [cards])

  // initialize the ForceGraph3D instance once
  useEffect(() => {
    if (!containerRef.current) return
    if (!fgRef.current) {
      const instance = new ForceGraph3D(containerRef.current!) as any as ForceGraph3DInstance<NodeRuntime, LinkRuntime>
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
      const isProposed = (link: LinkRuntime) => {
        const m = link.meta
        if (!m) return false
        if (Array.isArray(m)) return m.some((s) => (s || '').toLowerCase().includes('proposed'))
        return (m || '').toLowerCase().includes('proposed')
      }
      // width and base color adapt to meta:proposed
      instance.linkWidth((link) => (isProposed(link) ? 0.6 : 1))
      instance.linkColor((link) => (isProposed(link) ? '#9ca3af' : 'rgba(0,0,0,0.35)'))
      // Direction cones to indicate source -> target
      instance.linkDirectionalArrowLength((link) => (isProposed(link) ? 3 : 6))
      instance.linkDirectionalArrowRelPos(0.6)
      instance.linkDirectionalArrowResolution(8)
      instance.linkDirectionalArrowColor((link) => {
        if (isProposed(link)) return '#9ca3af'
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
      instance.linkLabel((link: LinkRuntime) => {
        const linkSource = link.source as NodeRuntime
        const linkTarget = link.target as NodeRuntime
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
        if (isProposed(link)) return '#9ca3af'
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

  const focus = useCallback(() => {
    fgRef.current?.zoomToFit(400, 40)
  }, [fgRef.current])

  // Bind F key to focus
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'f') {
        event.preventDefault()
        focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [focus])

  // update data on instance when it changes
  useEffect(() => {
    if (!fgRef.current) return
    // Apply visibility filters via filtering graph data before passing to ForceGraph
    const visibleTypes = filters.visibleNodeTypes
    const isTypeVisible = (t?: string) => (t ? visibleTypes[t] !== false : true)
    const showProposed = filters.showProposedEdges !== false

    const filteredNodes = data.nodes.filter((n) => isTypeVisible(n.type))
    const nodeIdSet = new Set(filteredNodes.map((n) => n.id))
    const isProposed = (meta: any) => {
      if (!meta) return false
      if (Array.isArray(meta)) return meta.some((s) => (s || '').toLowerCase().includes('proposed'))
      return (meta || '').toLowerCase().includes('proposed')
    }
    const filteredLinks = data.links.filter((l) => {
      const s = typeof l.source === 'string' ? l.source : l.source.id
      const t = typeof l.target === 'string' ? l.target : l.target.id
      if (!nodeIdSet.has(s) || !nodeIdSet.has(t)) return false
      if (!showProposed && isProposed(l.meta)) return false
      return true
    })

    fgRef.current.graphData({ nodes: filteredNodes as any, links: filteredLinks as any })
    // try to fit the graph nicely on first load of data
    if (data.nodes?.length) {
      setTimeout(focus, 0)
      setTimeout(focus, 500)
    }
  }, [data, filters.visibleNodeTypes, filters.showProposedEdges])

  // Track node types in a separate effect to seed filter defaults
  useEffect(() => {
    const types = Array.from(new Set((data.nodes || []).map((n) => n.type))).filter(Boolean) as string[]
    if (types.length) ensureNodeTypes(types)
  }, [data.nodes.map((n) => n.type).join('|')])

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
