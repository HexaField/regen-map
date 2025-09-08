import { createSimpleStore } from '@hexafield/simple-store/react'
import { NodeObject } from '3d-force-graph'
import { Mesh } from 'three'

import { SelectedProfileState } from './ProfileState'

export type Entity = {
  predicate: string
  name: string
  primary_url: string
  description: string
  images: string | string[]
  urls: string | string[]
  country_name: string
  geolocation?: string
}

export type Relationship = {
  subject_url: string
  object_url: string
  predicate_url: string
  meta: string
}

export type Node = Entity & {
  id: string
  type: 'person' | 'project' | 'organization'
}

export type NodeRuntime = Node &
  NodeObject & {
    __threeObj?: Mesh
  }

export type Link = {
  source: string
  target: string
  type: string
  meta: string
}

export type LinkRuntime = Omit<Link, 'source' | 'target'> & {
  source: NodeRuntime
  target: NodeRuntime
  index: number
  __controlPoints: null
  __indexColor: string
  // optional visual layout props (computed at runtime)
  curvature?: number
  curveRotation?: number
  multiIndex?: number
  multiCount?: number
}

export type GraphDataType = {
  nodes: Node[]
  links: (Link | LinkRuntime)[]
}

export type GraphDataRuntimeType = {
  nodes: NodeRuntime[]
  links: LinkRuntime[]
}

// Right drawer (Node Information/Profile)
export const GraphState = createSimpleStore<GraphDataRuntimeType>({
  nodes: [],
  links: []
})

export const FocusedNodeState: ReturnType<typeof createSimpleStore<NodeRuntime[]>> = createSimpleStore<NodeRuntime[]>(
  []
)

export const setFocusedNode = (focusedNode: NodeRuntime) => {
  const data = GraphState.get()
  const links = Array.from(
    new Map(
      data.links
        .filter((link) => link.source.id === focusedNode.id || link.target.id === focusedNode.id)
        .map((link) => {
          const target = link.target.id === focusedNode.id ? link.target : link.source
          const source = link.source.id === focusedNode.id ? link.target : link.source
          return [source.id + '-' + target.id, link]
        })
    ).values()
  )
  SelectedProfileState.set({
    id: focusedNode.id,
    name: focusedNode.name,
    title: focusedNode.description,
    image: Array.isArray(focusedNode.images) ? focusedNode.images[0] : focusedNode.images,
    location: focusedNode.country_name,
    links: (() => {
      const urls = focusedNode.urls
      if (!urls) return []
      const arr = Array.isArray(urls) ? urls : urls.split(',')
      return arr.map((url) => ({ label: url, href: url }))
    })(),
    tags: [],
    relationships: links.map((link) => {
      const target = link.target.id === focusedNode.id ? link.source : link.target
      return {
        name: target.name,
        image: target.images ? (Array.isArray(target.images) ? target.images[0] : target.images) : ''
      }
    })
  })
  FocusedNodeState.set([focusedNode])
}

export const closeFocusedNode = () => {
  FocusedNodeState.set([])
}
