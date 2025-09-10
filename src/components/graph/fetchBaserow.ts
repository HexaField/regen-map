import { Entity, LinkRuntime, Node, Relationship } from '../../state/GraphState'

// Baserow setup
const BASEROW_API_URL = import.meta.env.VITE_BASEROW_API_URL || 'https://api.baserow.io'
const BASEROW_TOKEN = import.meta.env.VITE_BASEROW_API_TOKEN

type BaserowRowsPage<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

const authHeaders = () => ({
  Authorization: `Token ${BASEROW_TOKEN}`
})

const http = async <T>(url: string): Promise<T> => {
  const res = await fetch(url, { headers: authHeaders(), cache: 'no-store' })
  if (!res.ok) throw new Error(`Baserow HTTP ${res.status}: ${await res.text()}`)
  return (await res.json()) as T
}

const fetchAllRows = async <T>(tableId: number): Promise<T[]> => {
  const pageSize = 200
  let url = `${BASEROW_API_URL}/api/database/rows/table/${tableId}/?user_field_names=true&page_size=${pageSize}`
  const all: T[] = []
  while (url) {
    const page = await http<BaserowRowsPage<T>>(url)
    all.push(...page.results)
    url = page.next?.replace('http://', 'https://') || ''
  }
  return all
}

export const fetchBaserow = async () => {
  const rows = {
    Entities: 670232,
    Relationships: 670233,
    EcosystemEntities: 670234,
    EcosystemRelationships: 670235
  }
  // Assumption: There are 4 Baserow databases named exactly like the previous sheets.
  const [entities, relationships, ecosystemEntities, ecosystemRelationships] = (await Promise.all([
    fetchAllRows<Entity>(rows.Entities),
    fetchAllRows<Relationship>(rows.Relationships),
    fetchAllRows<Entity>(rows.EcosystemEntities),
    fetchAllRows<Relationship>(rows.EcosystemRelationships)
  ])) as [Entity[], Relationship[], Entity[], Relationship[]]

  const filteredEntities = [entities, ecosystemEntities].flat().filter((e) => !!e.predicate)
  const nodes: Node[] = filteredEntities.map((entity) => ({
    ...entity,
    type: (entity.predicate.split(':')[0] as Node['type']) || 'organization',
    id: entity.predicate
  }))
  const filteredRelationships = [relationships, ecosystemRelationships].flat().filter((e) => !!e.predicate_url)

  const edges: LinkRuntime[] = filteredRelationships
    .filter((e) => nodes.find((n) => n.id === e.subject_url) && nodes.find((n) => n.id === e.object_url))
    .map((edge, i) => {
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

  // Group links by unordered node-pair to compute curvature for multiple parallel links
  const groups = new Map<string, LinkRuntime[]>()
  for (const l of edges) {
    const a = l.source.id
    const b = l.target.id
    const key = a < b ? `${a}__${b}` : `${b}__${a}`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(l)
  }
  const BOW_STEP = 0.2
  for (const [, links] of groups.entries()) {
    if (links.length === 1) {
      links[0].curvature = 0
      links[0].curveRotation = 0
      links[0].multiIndex = 0
      links[0].multiCount = 1
      continue
    }
    links.sort((l1, l2) => (l1.type || '').localeCompare(l2.type || '') || l1.index - l2.index)
    const count = links.length
    const offsets = links.map((_, i) => i - (count - 1) / 2)
    links.forEach((l, i) => {
      l.multiIndex = i
      l.multiCount = count
      l.curvature = offsets[i] * BOW_STEP
      const golden = Math.PI * (3 - Math.sqrt(5))
      l.curveRotation = (i * golden) % (Math.PI * 2)
    })
  }

  return { nodes, links: edges }
}
