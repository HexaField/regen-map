import { Link, Node } from '../../state/GraphState'
import { Organization, Person, SchemaOrg } from './murmurations/index'

const fetchJSON = async (url: string): Promise<unknown> => {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const json = await response.json()
    return json
  } catch (error) {
    console.error('Failed to fetch data:', error)
    throw error
  }
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
      images: [person.image!, ...(person.images?.map((img) => img.url) ?? [])].filter(Boolean),
      urls: person.urls?.map((u) => u.url).filter(Boolean) || [],
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
      images: [org.image!, ...(org.images?.map((img) => img.url) ?? [])].filter(Boolean),
      urls: org.urls?.map((u) => u.url).filter(Boolean) || [],
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

const url = 'https://data.collaborative.tech/murmurations.json'
const primary_url = 'collaborative.tech'

export const fetchCTA = async () => {
  // const data = (await fetchJSON(url)) as Organization
  // const primary_url = data.primary_url!
  const [people, orgs] = await Promise.all([
    new Promise<Person[]>(async (resolve) => {
      const queryParams = new URLSearchParams({
        // primary_url: primary_url,
        schema: 'people_schema-v0.1.0'
      }).toString()
      const apiUrl = `https://index.murmurations.network/v2/nodes?${queryParams}`

      const { data: murmurationsData } = (await fetchJSON(apiUrl)) as { data: Organization[] }
      console.log({ murmurationsData })

      resolve(
        (
          await Promise.all(
            murmurationsData.map(async (relationship) => {
              try {
                const response = (await fetchJSON(relationship.profile_url)) as Person[] | { data: Person[] }
                if ('linked_schemas' in response) {
                  return response as Person[]
                } else if ('data' in response) {
                  return response.data as Person[]
                }
                return []
              } catch (error) {
                return []
              }
            })
          )
        ).flat()
      )
    }),
    new Promise<Organization[]>(async (resolve) => {
      const queryParams = new URLSearchParams({
        primary_url: primary_url,
        schema: 'organizations_schema-v1.0.0'
      }).toString()
      const apiUrl = `https://index.murmurations.network/v2/nodes?${queryParams}`

      const { data: murmurationsData } = (await fetchJSON(apiUrl)) as { data: Organization[] }
      console.log({ murmurationsData })

      resolve(
        (
          await Promise.all(
            murmurationsData.map(async (relationship) => {
              try {
                const response = (await fetchJSON(relationship.profile_url)) as
                  | Organization[]
                  | { data: Organization[] }
                if ('linked_schemas' in response) {
                  return response as Organization[]
                } else if ('data' in response) {
                  return response.data as Organization[]
                }
                return []
              } catch (error) {
                return []
              }
            })
          )
        ).flat()
      )
    })
  ])
  console.log({ people, orgs })
  const { nodes, links } = fromKumuToGraph(people, orgs)
  console.log({ nodes, links })
  return {
    nodes,
    links
  }
}
