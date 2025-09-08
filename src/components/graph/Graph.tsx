import { useSimpleStore } from '@hexafield/simple-store/react'
import ForceGraph3D, { type ForceGraph3DInstance } from '3d-force-graph'
import React, { useCallback, useEffect, useRef } from 'react'
import { Color, DoubleSide, Group, Mesh, ShaderMaterial, SphereGeometry } from 'three'
import SpriteText from 'three-spritetext'

import { CommunityCardsState } from '../../state/CommunityCardsState'
import { ensureNodeTypes, GraphFilterState } from '../../state/GraphFilterState'
import {
  closeFocusedNode,
  FocusedNodeState,
  GraphDataRuntimeType,
  GraphDataType,
  GraphState,
  Link,
  LinkRuntime,
  Node,
  NodeRuntime,
  setFocusedNode
} from '../../state/GraphState'
import { SelectedProfileState } from '../../state/ProfileState'
import { dataSourceFetchers } from './dataSources'

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
  // node label size (world units) from filters state
  const [filters] = useSimpleStore(GraphFilterState)
  const labelSizeRef = useRef(filters.labelSize)
  useEffect(() => {
    labelSizeRef.current = filters.labelSize
    // update all existing labels when size changes
    for (const [, label] of labelMap.current.entries()) {
      try {
        label.textHeight = filters.labelSize
      } catch {}
    }
  }, [filters.labelSize])

  // refs for container and graph instance
  const containerRef = useRef<HTMLDivElement | null>(null)
  const fgRef = useRef<ForceGraph3DInstance<NodeRuntime, LinkRuntime> | null>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)
  const orgSphereMap = useRef<Map<string, Mesh>>(new Map())
  const labelMap = useRef<Map<string, any>>(new Map())
  const isDarkRef = useRef<boolean>(document.documentElement.classList.contains('dark'))

  const [focusedNode] = useSimpleStore(FocusedNodeState)
  const [profile, setProfile] = useSimpleStore(SelectedProfileState)
  // filters already declared above

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
      // Set initial background based on current theme
      const isDark = document.documentElement.classList.contains('dark')
      instance.backgroundColor(isDark ? '#000000' : '#f5f5f4') // dark:black, light:neutral-100
      instance.showNavInfo(false)
      instance.nodeRelSize(6)
      instance.nodeOpacity(0.9)
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
      instance.linkDirectionalArrowLength((link) => {
        const spheresOn = GraphFilterState.get().organizationSpheres
        const touchesOrg =
          (link.source as any)?.type === 'organization' || (link.target as any)?.type === 'organization'
        if (spheresOn && touchesOrg) return 0
        return isProposed(link) ? 3 : 6
      })
      instance.linkDirectionalArrowRelPos(0.6)
      instance.linkDirectionalArrowResolution(8)
      // Colors are assigned by a dynamic function below (focus fade aware)
      instance.cooldownTime(3000)
      // Keep default tooltip label if desired
      instance.nodeLabel('name')
      instance.nodeThreeObjectExtend(true)
      instance.nodeThreeObject((node: Node) => {
        const group = new Group()
        // Label
        const label: any = new SpriteText(node.name || '')
        label.textHeight = labelSizeRef.current
        if (document.documentElement.classList.contains('dark')) {
          label.color = '#fff'
          label.backgroundColor = 'rgba(31,31,31,0.85)'
        } else {
          label.color = '#111'
          label.backgroundColor = 'rgba(255,255,255,0.85)'
        }
        label.padding = 2
        // mark label for interaction filtering
        try {
          label.userData = label.userData || {}
          label.userData.__isOrgLabel = node.type === 'organization'
          label.userData.__nodeId = node.id
        } catch {}
        if (label.material) {
          label.material.depthWrite = false
          label.material.depthTest = false
        }
        // @ts-ignore - renderOrder exists at runtime on Object3D
        label.renderOrder = 999
        group.add(label)
        // Track label for dynamic visibility toggles
        labelMap.current.set(node.id, label)

        // Organization sphere (hidden by default, toggled/updated on tick)
        if (node.type === 'organization') {
          // Fresnel halo shader: transparent in center, brighter towards rim
          const haloMaterial = new ShaderMaterial({
            uniforms: {
              uColor: { value: new Color('springgreen') },
              uOpacity: { value: 0.6 }, // max edge opacity
              uPower: { value: 2.0 }, // falloff exponent
              uBase: { value: 0.02 } // minimum center opacity
            },
            vertexShader: `
              varying vec3 vNormal;
              varying vec3 vViewPosition;
              void main() {
                vNormal = normalize(normalMatrix * normal);
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                vViewPosition = -mvPosition.xyz;
                gl_Position = projectionMatrix * mvPosition;
              }
            `,
            fragmentShader: `
              precision mediump float;
              varying vec3 vNormal;
              varying vec3 vViewPosition;
              uniform vec3 uColor;
              uniform float uOpacity;
              uniform float uPower;
              uniform float uBase;
              void main() {
                vec3 n = normalize(vNormal);
                vec3 v = normalize(vViewPosition);
                float ndotv = abs(dot(n, v));
                float fresnel = pow(1.0 - ndotv, uPower);
                float alpha = clamp(uBase + fresnel * uOpacity, 0.0, 1.0);
                gl_FragColor = vec4(uColor, alpha);
              }
            `,
            transparent: true,
            depthWrite: false,
            side: DoubleSide
          })
          const sphere = new Mesh(new SphereGeometry(1, 20, 20), haloMaterial)
          sphere.visible = false
          // Make sphere non-pickable so clicks go through only to label
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          ;(sphere as any).raycast = () => {}
          try {
            sphere.userData = sphere.userData || {}
            sphere.userData.__isOrgSphere = true
            sphere.userData.__nodeId = node.id
          } catch {}
          // keep label centered; updateOrgSpheres will scale sphere only. Optionally, lift label a bit for readability
          label.position.set(0, 0, 0)
          group.add(sphere)
          orgSphereMap.current.set(node.id, sphere)
        }

        return group
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
      // Apply dynamic color/opacity functions
      const applyDynamicColors = () => {
        if (!fgRef.current) return
        const baseNodeColorByType = (t?: string) => {
          if (t === 'person') return 'blue'
          if (t === 'project') return 'orange'
          if (t === 'organization') return 'green'
          return 'gray'
        }

        const baseLinkColor = (link: LinkRuntime) => {
          // Invisible if spheres mode is on and link touches an organization
          const spheresOn = GraphFilterState.get().organizationSpheres
          const touchesOrg =
            (link.source as any)?.type === 'organization' || (link.target as any)?.type === 'organization'
          if (spheresOn && touchesOrg) return 'rgba(0,0,0,0)'
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
        }

        const getFadeShades = () => {
          const isDark = isDarkRef.current
          return {
            node: isDark ? 'rgba(55,65,81,0.25)' : 'rgba(229,231,235,0.35)', // neutral-700 vs neutral-200
            link: isDark ? 'rgba(75,85,99,0.25)' : 'rgba(156,163,175,0.3)', // neutral-600 vs neutral-400
            arrow: isDark ? 'rgba(75,85,99,0.25)' : 'rgba(156,163,175,0.3)'
          }
        }

        const isLitNode = (node: NodeRuntime) => {
          const fade = GraphFilterState.get().focusFade
          const focused = FocusedNodeState.get()
          if (!fade || !focused) return true
          if (node.id === focused.id) return true
          // neighbor if directly connected to focused via any link
          const neighbors = new Set<string>()
          for (const l of GraphState.get().links) {
            if (l.source.id === focused.id) neighbors.add(l.target.id)
            if (l.target.id === focused.id) neighbors.add(l.source.id)
          }
          return neighbors.has(node.id)
        }

        const isLitLink = (link: LinkRuntime) => {
          const fade = GraphFilterState.get().focusFade
          const focused = FocusedNodeState.get()
          if (!fade || !focused) return true
          // Only keep links lit that connect to the focused node
          return link.source.id === focused.id || link.target.id === focused.id
        }

        fgRef.current.nodeColor((node) => {
          const orgSpheres = GraphFilterState.get().organizationSpheres
          if (orgSpheres && node.type === 'organization') return 'rgba(0,0,0,0.001)'
          if (isLitNode(node as NodeRuntime)) return baseNodeColorByType((node as NodeRuntime).type)
          return getFadeShades().node
        })

        fgRef.current.linkColor((link) => {
          const c = baseLinkColor(link as LinkRuntime)
          if (!GraphFilterState.get().focusFade) return c
          if (isLitLink(link as LinkRuntime)) return c
          return getFadeShades().link
        })

        fgRef.current.linkDirectionalArrowColor((link) => {
          const c = baseLinkColor(link as LinkRuntime)
          if (!GraphFilterState.get().focusFade) return c
          if (isLitLink(link as LinkRuntime)) return c
          return getFadeShades().arrow
        })

        // Also dim link opacity when faded
        try {
          ;(fgRef.current as any).linkOpacity((link: any) => {
            if (!GraphFilterState.get().focusFade) return 0.3
            return isLitLink(link as LinkRuntime) ? 0.3 : 0.12
          })
        } catch {}
      }

      applyDynamicColors()
      // Apply curvature and rotation for multi-links
      instance.linkCurvature((l) => l.curvature ?? 0)
      instance.linkCurveRotation((l) => l.curveRotation ?? 0)
      instance.onNodeClick((n) => {
        setFocusedNode(n)
      })

      // Prevent dragging org nodes when spheres are enabled
      const preventOrgDrag = (n: NodeRuntime) => {
        const on = GraphFilterState.get().organizationSpheres
        if (on && n?.type === 'organization') {
          n.fx = undefined
          n.fy = undefined
          n.fz = undefined
        }
      }
      instance.onNodeDrag(preventOrgDrag)
      instance.onNodeDragEnd(preventOrgDrag)

      const updateOrgSpheres = () => {
        if (!fgRef.current) return
        const showSpheres = GraphFilterState.get().organizationSpheres
        const current = GraphState.get()
        // Build membership index: target org id -> member node ids
        const membersByOrg = new Map<string, NodeRuntime[]>()
        for (const l of current.links) {
          if (l.type === 'memberOf') {
            const org = l.target
            const member = l.source
            if (!membersByOrg.has(org.id)) membersByOrg.set(org.id, [])
            membersByOrg.get(org.id)!.push(member)
          }
        }
        for (const [orgId, mesh] of orgSphereMap.current.entries()) {
          const orgNode = current.nodes.find((n) => n.id === orgId)
          if (!orgNode) {
            mesh.visible = false
            continue
          }
          const members = membersByOrg.get(orgId) || []
          // Compute max distance from org to its members
          let maxR = 0
          for (const m of members) {
            const dx = (m.x || 0) - (orgNode.x || 0)
            const dy = (m.y || 0) - (orgNode.y || 0)
            const dz = (m.z || 0) - (orgNode.z || 0)
            const d = Math.sqrt(dx * dx + dy * dy + dz * dz)
            if (d > maxR) maxR = d
          }
          // margin so nodes are inside
          const margin = members.length ? 10 : 0
          const radius = Math.max(18, maxR + margin)
          mesh.scale.set(radius, radius, radius)
          // Ensure the sphere is centered on the org node
          mesh.position.set(0, 0, 0) // group is anchored to node position
          mesh.visible = showSpheres && members.length > 0
        }
      }

      // Update org spheres sizing each engine tick
      instance.onEngineTick(() => {
        updateOrgSpheres()
      })

      // Expose helper on instance for external calls
      ;(instance as any).__updateOrgSpheres = updateOrgSpheres
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

  // React to theme changes for background and label styles
  useEffect(() => {
    const applySceneTheme = (isDark: boolean) => {
      if (!fgRef.current) return
      isDarkRef.current = isDark
      fgRef.current.backgroundColor(isDark ? '#000000' : '#f5f5f4')
      // Update all existing labels
      for (const [, label] of labelMap.current.entries()) {
        try {
          label.color = isDark ? '#ffffff' : '#111111'
          label.backgroundColor = isDark ? 'rgba(31,31,31,0.85)' : 'rgba(255,255,255,0.85)'
          if (label.material) {
            label.material.needsUpdate = true
          }
        } catch {}
      }
      // Re-apply focus fade visuals to adjust faded shade for theme
      try {
        const prevData: any = (fgRef.current as any).graphData?.()
        if (prevData) fgRef.current.graphData(prevData)
      } catch {}
    }

    const handler = (e: any) => applySceneTheme(!!e?.detail?.isDark)
    // Apply immediately on mount using current class
    applySceneTheme(document.documentElement.classList.contains('dark'))
    window.addEventListener('themechange', handler as any)
    return () => window.removeEventListener('themechange', handler as any)
  }, [])

  // Apply focus-fade visuals to labels and org spheres when focus/toggle/theme changes
  useEffect(() => {
    if (!fgRef.current) return
    const focused = focusedNode
    const fade = GraphFilterState.get().focusFade
    const isDark = isDarkRef.current
    const fadedTextColor = isDark ? '#6b7280' : '#9ca3af' // neutral-500 vs neutral-400
    const fadedBg = isDark ? 'rgba(31,41,55,0.5)' : 'rgba(243,244,246,0.6)' // neutral-800 vs neutral-100

    const neighbors = new Set<string>()
    if (focused && fade) {
      for (const l of GraphState.get().links) {
        if (l.source.id === focused.id) neighbors.add(l.target.id)
        if (l.target.id === focused.id) neighbors.add(l.source.id)
      }
    }

    // Update labels
    for (const [id, label] of labelMap.current.entries()) {
      const node = GraphState.get().nodes.find((n) => n.id === id)
      if (!node || !label || !label.material) continue
      const lit = !fade || !focused ? true : id === focused.id || neighbors.has(id)
      // Ensure transparency enabled
      try {
        label.material.transparent = true
      } catch {}
      if (lit) {
        label.material.opacity = 1
        label.color = isDark ? '#ffffff' : '#111111'
        label.backgroundColor = isDark ? 'rgba(31,31,31,0.85)' : 'rgba(255,255,255,0.85)'
      } else {
        label.material.opacity = 0.35
        label.color = fadedTextColor
        label.backgroundColor = fadedBg
      }
      try {
        label.material.needsUpdate = true
      } catch {}
    }

    // Update org spheres
    for (const [id, mesh] of orgSphereMap.current.entries()) {
      const mat = mesh.material as ShaderMaterial | undefined
      if (!mat || !(mat as any).uniforms) continue
      const lit = !fade || !focused ? true : id === focused.id || neighbors.has(id)
      const color = new Color(lit ? 'springgreen' : isDark ? '#4b5563' : '#9ca3af') // neutral-600/400
      try {
        ;(mat.uniforms as any).uColor.value = color
        ;(mat.uniforms as any).uOpacity.value = lit ? 0.6 : 0.2
        mat.needsUpdate = true
      } catch {}
    }

    // Update default node meshes' opacity (skip org spheres and labels)
    try {
      const current: any = (fgRef.current as any).graphData?.()
      const nodes: any[] = current?.nodes || []
      for (const n of nodes) {
        const rootObj: any = (n as any).__threeObj
        if (!rootObj) continue
        const lit = !fade || !focused ? true : n.id === focused.id || neighbors.has(n.id)
        rootObj.traverse?.((obj: any) => {
          if (obj?.type !== 'Mesh') return
          if (obj?.userData?.__isOrgSphere) return
          // Skip SpriteText labels (type 'Sprite')
          if (obj?.isSprite) return
          const mat = obj.material
          if (!mat) return
          try {
            mat.transparent = true
            mat.opacity = lit ? 1 : 0.45
            mat.needsUpdate = true
          } catch {}
        })
      }
    } catch {}

    // Trigger a graph refresh so dynamic color functions re-evaluate
    try {
      const prevData: any = (fgRef.current as any).graphData?.()
      if (prevData) fgRef.current.graphData(prevData)
    } catch {}
  }, [focusedNode, GraphFilterState.get().focusFade, GraphFilterState.get().organizationSpheres])

  useEffect(() => {
    if (!focusedNode || !fgRef.current) return

    const node = focusedNode
    const lookAt = { x: node?.x || 0, y: node?.y || 0, z: node?.z || 0 }

    // If focusing an organization with spheres enabled, fit the sphere in view
    const spheresOn = GraphFilterState.get().organizationSpheres
    const sphere = orgSphereMap.current.get(node.id)
    if (spheresOn && node.type === 'organization' && sphere) {
      // Ensure sphere is up-to-date
      const updater = (fgRef.current as any).__updateOrgSpheres
      if (updater) updater()

      const cam: any = (fgRef.current as any).camera?.()
      const fov = cam?.fov ? (cam.fov * Math.PI) / 180 : (75 * Math.PI) / 180
      const radius = sphere.scale?.x || 20
      const padding = 1.15
      const minDist = (radius * padding) / Math.tan(fov / 2)

      const currentPos = cam?.position || { x: 0, y: 0, z: 1 }
      // Direction from node to camera
      const dir = {
        x: currentPos.x - lookAt.x,
        y: currentPos.y - lookAt.y,
        z: currentPos.z - lookAt.z
      }
      const len = Math.hypot(dir.x, dir.y, dir.z) || 1
      const nx = dir.x / len
      const ny = dir.y / len
      const nz = dir.z / len

      const targetPos = { x: lookAt.x + nx * minDist, y: lookAt.y + ny * minDist, z: lookAt.z + nz * minDist }
      fgRef.current.cameraPosition(targetPos, lookAt, 800)
      return
    }

    // Default: center camera on node with a nice offset
    const baseDist = 120
    const distRatio = 1 + baseDist / Math.hypot(node?.x || 0, node?.y || 0, node?.z || 0)
    fgRef.current.cameraPosition(
      { x: (node?.x || 0) * distRatio, y: (node?.y || 0) * distRatio, z: (node?.z || 0) * distRatio },
      lookAt,
      800
    )
  }, [focusedNode, GraphFilterState.get().organizationSpheres])

  useEffect(() => {
    if (!profile?.id || profile.id === focusedNode?.id) return
    setFocusedNode(data.nodes.find((n) => n.id === profile.id)!)
  }, [profile?.id])

  const focus = useCallback(() => {
    fgRef.current?.zoomToFit(400, 40)
  }, [fgRef.current])

  // Bind F key to focus and Escape to clear selection
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'f') {
        event.preventDefault()
        focus()
      } else if (event.key === 'Escape') {
        // Do not prevent default so other UI (e.g., modals) can also respond if needed
        closeFocusedNode()
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

    const orgTypeVisible = visibleTypes['organization'] !== false
    const filteredNodes = data.nodes.filter((n) => {
      if (n.type === 'organization' && filters.organizationSpheres) return orgTypeVisible
      return isTypeVisible(n.type)
    })
    const nodeIdSet = new Set(filteredNodes.map((n) => n.id))
    const isProposed = (meta: any) => {
      if (!meta) return false
      if (Array.isArray(meta)) return meta.some((s) => (s || '').toLowerCase().includes('proposed'))
      return (meta || '').toLowerCase().includes('proposed')
    }
    const filteredLinks = data.links.filter((l) => {
      const sObj = l.source as NodeRuntime
      const tObj = l.target as NodeRuntime
      const s = sObj?.id
      const t = tObj?.id
      if (!s || !t) return false
      if (!nodeIdSet.has(s) || !nodeIdSet.has(t)) return false
      if (!showProposed && isProposed(l.meta)) return false
      return true
    })

    fgRef.current.graphData({ nodes: filteredNodes as any, links: filteredLinks as any })
    // Trigger sphere resize/visibility update now (not just on ticks)
    const updater = (fgRef.current as any).__updateOrgSpheres
    if (updater) updater()
    // Ensure org default meshes are not pickable when spheres mode is on (labels remain clickable)
    try {
      const spheresOn = GraphFilterState.get().organizationSpheres
      if (spheresOn) {
        for (const n of filteredNodes) {
          if (n.type !== 'organization') continue
          const rootObj: any = (n as any).__threeObj
          if (!rootObj) continue
          rootObj.traverse?.((obj: any) => {
            if (obj?.type === 'Mesh' && !obj?.userData?.__isOrgSphere) {
              if (!obj.__origRaycast && typeof obj.raycast === 'function') {
                obj.__origRaycast = obj.raycast
              }
              // eslint-disable-next-line @typescript-eslint/no-empty-function
              obj.raycast = () => {}
            }
          })
        }
      }
    } catch {}
    // try to fit the graph nicely on first load of data
    if (data.nodes?.length) {
      // setTimeout(focus, 0)
      // setTimeout(focus, 500)
    }
  }, [data, filters.visibleNodeTypes, filters.showProposedEdges, filters.organizationSpheres])

  // When toggling organization spheres, update node size/forces and keep dynamic colors
  useEffect(() => {
    if (!fgRef.current) return
    // Shrink org nodes to near-zero size so default mesh is effectively hidden
    fgRef.current.nodeVal((node) => (filters.organizationSpheres && node.type === 'organization' ? 0.0001 : 1))

    // Toggle our custom label visibility for orgs
    for (const [id, label] of labelMap.current.entries()) {
      const n = GraphState.get().nodes.find((nn) => nn.id === id)
      if (!n) continue
      if (n.type === 'organization') label.visible = true
    }

    // Bump memberOf link strength slightly when spheres are on
    const linkForce: any = (fgRef.current as any).d3Force?.('link')
    if (linkForce && typeof linkForce.strength === 'function') {
      linkForce.strength(0.5)
    }

    // Force color recalculation to apply invisibility
    const prevData: any = (fgRef.current as any).graphData?.()
    if (prevData) fgRef.current.graphData(prevData)

    // Toggle org node default mesh pickability: when spheres are on, only labels should be clickable
    try {
      const current: any = (fgRef.current as any).graphData?.()
      const nodes: any[] = current?.nodes || []
      for (const n of nodes) {
        if (n.type !== 'organization') continue
        const rootObj: any = (n as any).__threeObj
        if (!rootObj) continue
        rootObj.traverse?.((obj: any) => {
          if (obj?.type !== 'Mesh') return
          const isOrgSphere = !!obj?.userData?.__isOrgSphere
          if (isOrgSphere) return // sphere already non-pickable
          if (filters.organizationSpheres) {
            if (!obj.__origRaycast && typeof obj.raycast === 'function') obj.__origRaycast = obj.raycast
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            obj.raycast = () => {}
          } else if (obj.__origRaycast) {
            obj.raycast = obj.__origRaycast
          }
        })
      }
    } catch {}
  }, [filters.organizationSpheres])

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
    <div className="w-full flex-1">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  )
}
