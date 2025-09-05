import { useSimpleStore } from '@hexafield/simple-store/react'
import ForceGraph3D, { LinkObject, type ForceGraph3DInstance } from '3d-force-graph'
import React, { useCallback, useEffect, useRef } from 'react'
import SpriteText from 'three-spritetext'

import {
  Entity,
  FocusedNodeState,
  GraphDataType,
  GraphState,
  Link,
  Node,
  Relationship,
  RuntimeNode,
  setFocusedNode
} from '../../state/GraphState'
import { SelectedProfileState } from '../../state/ProfileState'
import { fetchSheets } from './GoogleSheets'

const getLinkKey = (link: Link) =>
  `${typeof link.source === 'string' ? link.source : link.source.id}-${link.type}-${typeof link.target === 'string' ? link.target : link.target.id}`

const mergeNodes = (prevData: GraphDataType, rawData: GraphDataType) => {
  /** Update nodes whilst preserving existing simulation */
  const existingNodeIDs = new Set<string>(prevData.nodes.map((n) => n.id))
  const existingLinksIDs = new Set<string>(prevData.links.map(getLinkKey))

  const seenNodeIDs = new Set<string>()
  const seenLinkIDs = new Set<string>()

  const seenNodeNames = new Map<string, Entity>()

  // get all new data
  const newNodesData = [] as Node[]
  const newLinksData = [] as Link[]

  const nodes = rawData.nodes as Node[]

  // Add person nodes
  for (const node of nodes) {
    if (seenNodeNames.has(node.name)) {
      continue
    }
    seenNodeIDs.add(node.id as string)
    seenNodeNames.set(node.name, node)
    if (!existingNodeIDs.has(node.id as string)) {
      newNodesData.push(node)
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

  for (const link of rawData.links) {
    const linkKey = getLinkKey(link)
    seenLinkIDs.add(linkKey)
    if (!existingLinksIDs.has(linkKey)) {
      newLinksData.push(link)
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

  prevData.links.push(...newLinksData)

  let lastLinkIndex =
    prevData.links.find((l) => typeof l.source !== 'string' && typeof l.target !== 'string')?.index ?? 0

  for (const link of prevData.links) {
    // ensure source and target are NodeData objects, and add index and __controlPoints if missing to fix bug in force-graph
    if (typeof link.source === 'string') {
      const sourceNode = prevData.nodes.find((n) => n.id === link.source.id)
      const targetNode = prevData.nodes.find((n) => n.id === link.target.id)

      link.source = sourceNode!
      link.target = targetNode!
      link.index = lastLinkIndex++
      link.__controlPoints = null
      link.__indexColor = '#a8001e'
    }
  }

  console.log('Merged graph data', prevData)

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
        setData(mergeNodes(data, sheetData))
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
    fgRef.current.graphData(data)
    // try to fit the graph nicely on first load of data
    if (data.nodes?.length) {
      setTimeout(focus, 0)
      setTimeout(focus, 500)
    }
  }, [data])

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
