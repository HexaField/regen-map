import { type FromSchema } from 'json-schema-to-ts'

import { Link, Node } from '../../../state/GraphState'
import { fetchJSON } from '../../common/fetchJSON'
import organizationsSchema from './organizations_schema-v1.0.0'
import peopleSchema from './people_schema-v0.1.0'

export type Organization = FromSchema<typeof organizationsSchema> & { profile_url: string }

export type Person = FromSchema<typeof peopleSchema> & { profile_url: string }

export type Project = Organization

export type IndexResponse = {
  last_updated: number
  linked_schemas: string[]
  name: string
  primary_url: string
  profile_url: string
  status: string // what are the possible values?
  tags: string[]
}

export type OrgIndexResponse = IndexResponse & Organization

export type PersonIndexResponse = IndexResponse & Person

export const SchemasMurmurations = {
  organizations: organizationsSchema,
  people: peopleSchema
}

export const SchemaOrg = {
  memberOf: 'https://schema.org/memberOf', // person => organization | project => organization
  knows: 'https://schema.org/knows', // person => person
  maintainer: 'https://schema.org/maintainer', // person => project
  softwareRequirement: 'https://schema.org/softwareRequirement' // project => project
}

const flatMurmurationsMap = async (url: string) => {
  const data = (await fetchJSON(url)) as (Person | Organization)[]
  console.log(data)
  const people = data.filter((item): item is Person => item.linked_schemas?.includes('people_schema-v0.1.0'))
  const orgs = data.filter((item): item is Organization => item.linked_schemas?.includes('organizations_schema-v1.0.0'))
  return { people, orgs }
}

const fromKumuToGraph = (people: Person[], orgs: Organization[]): { nodes: Node[]; links: Link[] } => {
  const nodes: Node[] = []
  const links: Link[] = []

  const nodeMap = new Map<string, Node>()

  people.forEach((person) => {
    const node: Node = {
      id: 'person://' + person.name.toLowerCase().replace(' ', '_'),
      name: person.name,
      primary_url: person.primary_url,
      description: person.description ?? '',
      images: [person.image!, ...(person.images?.map((img) => img.url) ?? [])].filter(Boolean).join(','),
      urls: (person.urls?.map((u) => u.url).filter(Boolean) || []).join(','),
      country_name: person.country_name ?? '',
      geolocation: [person.geolocation?.lat, person.geolocation?.lon].join(','),
      predicate: 'person://' + person.name.toLowerCase().replace(' ', '_'),
      type: 'person'
    }
    nodes.push(node)
    nodeMap.set(person.profile_url as string, node)
  })
  orgs.forEach((org) => {
    const node: Node = {
      id: 'organization://' + org.name.toLowerCase().replace(' ', '_'),
      name: org.name,
      primary_url: org.primary_url ?? '',
      description: org.description ?? '',
      images: [org.image!, ...(org.images?.map((img) => img.url) ?? [])].filter(Boolean).join(','),
      urls: (org.urls?.map((u) => u.url).filter(Boolean) || []).join(','),
      country_name: org.country_iso_3166 ?? '',
      geolocation: [org.geolocation?.lat, org.geolocation?.lon].join(','),
      predicate: 'organization://' + org.name.toLowerCase().replace(' ', '_'),
      type: 'organization'
    }
    nodes.push(node)
    nodeMap.set(org.profile_url as string, node)
  })

  people.forEach((person) => {
    person.relationships?.forEach((relationship) => {
      if (relationship.predicate_url === SchemaOrg.memberOf) {
        const org = nodeMap.get(relationship.object_url)
        if (org) {
          links.push({
            source: nodeMap.get(person.profile_url as string)!.id,
            target: nodeMap.get(relationship.profile_url as string)!.id,
            type: 'memberOf',
            meta: ''
          })
        }
      } else if (relationship.predicate_url === SchemaOrg.knows) {
        const otherPerson = nodeMap.get(relationship.object_url)
        if (otherPerson) {
          links.push({
            source: nodeMap.get(person.profile_url as string)!.id,
            target: otherPerson.id,
            type: 'knows',
            meta: ''
          })
        }
      } else if (relationship.predicate_url === SchemaOrg.maintainer) {
        const project = nodeMap.get(relationship.object_url)
        if (project) {
          links.push({
            source: nodeMap.get(person.profile_url as string)!.id,
            target: project.id,
            type: 'maintainer',
            meta: ''
          })
        }
      }
    })
  })
  orgs.forEach((org) => {
    org.relationships?.forEach((relationship) => {
      if (relationship.predicate_url === SchemaOrg.softwareRequirement) {
        const otherOrg = nodeMap.get(relationship.object_url)
        if (otherOrg) {
          links.push({
            source: nodeMap.get(org.profile_url as string)!.id,
            target: otherOrg.id,
            type: 'softwareRequirement',
            meta: ''
          })
        }
      }
    })
  })
  return {
    nodes,
    links
  }
}

export const queryMurmurationsIndex = async <T extends OrgIndexResponse | PersonIndexResponse>(
  schema: string,
  primary_url?: string
) => {
  const queryParams = new URLSearchParams({ schema })
  if (primary_url) {
    queryParams.append('primary_url', primary_url)
  }
  const apiUrl = `https://index.murmurations.network/v2/nodes?${queryParams.toString()}`

  const { data: murmurationsData } = (await fetchJSON(apiUrl)) as { data: T[] }
  console.log({ schema, murmurationsData })

  return (
    await Promise.all(
      murmurationsData.map(async (relationship) => {
        try {
          const response = (await fetchJSON(relationship.profile_url)) as T[] | { data: T[] }
          if ('linked_schemas' in response) {
            return response as T[]
          } else if ('data' in response) {
            return response.data as T[]
          }
          return []
        } catch (error) {
          return []
        }
      })
    )
  ).flat()
}
