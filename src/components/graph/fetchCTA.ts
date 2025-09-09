import { Link, Node } from '../../state/GraphState'
import { fetchJSON } from '../common/fetchJSON'

type Connection = {
  label: string
  from: string
  to: string
  strength: number
  'connection subtype':
    | 'should collaborate with'
    | 'should collaborate'
    | 'has supported'
    | 'should share a story for'
    | 'Is Related To'
    | 'should attend'
    | 'is collaborating with'
    | 'is member of'
    | 'member of'
    | 'is part of'
  description: string
  'connection type': 'Suggestion' | 'Your Perspective' | 'Relationship'
  'one-way': 'yes' | 'no'
  direction: 'directed' | 'undirected' | 'mutual'
  id: string
  url: string
  title: string
}

type Element =
  | {
      label: string
      image: string
      id: string
      type: 'Object Type' | 'Attribute' | 'Sector' | 'Location'
      description: string
    }
  | {
      id: string
      url: string
      'object url': string
      image: string
      type: 'Organization' | 'Member'
      topics: string[]
      tags: string[]
      'attribute-tags': string
      sectors: string[]
      locations: string[]
      address: string
      types: string[]
      skills: string[]
      color: string
      font_color: string
      draft: string
      page_text: string
      summary: string
      description: string
      size: string
      'related objects': string[] // IDs of related objects
      label: string
    }

type CTA_Kumu = {
  elements: Element[]
  connections: Connection[]
}

const fromKumuToGraph = (data: CTA_Kumu): { nodes: Node[]; links: Link[] } => {
  const nodes: Node[] = []
  const links: Link[] = []

  const nodeMap = new Map<string, Node>()

  for (const element of data.elements) {
    if (element.type === 'Organization' || element.type === 'Member') {
      const node: Node = {
        id: element.id,
        name: element.label,
        primary_url: element.url,
        description: element.description ?? '',
        images: element.image ?? '',
        urls: element.url ?? '',
        country_name: '',
        geolocation: '',
        predicate: element.url,
        type: element.type === 'Organization' ? 'organization' : 'person'
      }
      nodes.push(node)
      nodeMap.set(element.id, node)
    }
  }

  for (const connection of data.elements) {
    if (connection.type === 'Organization' || connection.type === 'Member') {
      if (!connection['related objects']?.length) continue
      for (const relatedId of connection['related objects']) {
        const relatedNode = nodeMap.get(relatedId)
        if (relatedNode) {
          links.push({
            source: nodeMap.get(connection.id)!.id,
            target: relatedNode.id,
            type: 'relatedTo',
            meta: ''
          })
        }
      }
    }
  }

  return { nodes, links }
}

export const fetchCTA = async () => {
  const response = await fetchJSON<CTA_Kumu>(
    'https://raw.githubusercontent.com/vincentivize/catalist/main/trove-collaborative-tech-alliance'
  )
  return fromKumuToGraph(response)
}
