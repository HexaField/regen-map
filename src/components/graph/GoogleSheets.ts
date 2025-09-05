import { Entity, Link, Node, Relationship } from '../../state/GraphState'

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

export const fetchSheets = async () => {
  const [entities, relationships, ecosystemEntities, ecosystemRelationships] = (await Promise.all([
    fetchSheet(encodeURIComponent('Entities')),
    fetchSheet(encodeURIComponent('Relationships')),
    fetchSheet(encodeURIComponent('EcosystemEntities')),
    fetchSheet(encodeURIComponent('EcosystemRelationships'))
  ])) as [Entity[], Relationship[], Entity[], Relationship[]]

  console.log({ entities, relationships, ecosystemEntities, ecosystemRelationships })

  const filteredEntities = [entities, ecosystemEntities].flat().filter((e) => !!e.predicate)
  // Align node ids with relationship URLs so links resolve
  const nodes: Node[] = filteredEntities.map((entity) => ({
    ...entity,
    type: entity.predicate.split(':')[0] as 'person' | 'project' | 'organization',
    id: entity.predicate
  }))
  const filteredRelationships = [relationships, ecosystemRelationships].flat().filter((e) => !!e.predicate_url)

  // Build initial edges array
  const edges: Link[] = filteredRelationships
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

  return { nodes, links: edges }
}
